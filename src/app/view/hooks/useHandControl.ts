import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

type Rotation = { rx: number; ry: number };

type Params = {
  enabled: boolean;
  videoEl: React.RefObject<HTMLVideoElement | null>;
  canvasEl?: React.RefObject<HTMLCanvasElement | null>;
  rotationRef: React.RefObject<Rotation>;
  onRotate: (rx: number, ry: number) => void;
  onHandDetected?: (detected: boolean) => void;
  onGrabChange?: (grabbing: boolean) => void;
  onError?: (msg: string) => void;
  pinchThreshold?: number;
  degPerNormX?: number;
  degPerNormY?: number;
  clampX?: number;
};

export function useHandControl({
  enabled,
  videoEl,
  canvasEl,
  rotationRef,
  onRotate,
  onHandDetected,
  onGrabChange,
  onError,
  pinchThreshold = 0.07,
  degPerNormX = 500,
  degPerNormY = 400,
  clampX = 80,
}: Params) {
  // Stable callback refs
  const callbacksRef = useRef({ onRotate, onHandDetected, onGrabChange, onError });
  
  useEffect(() => {
    callbacksRef.current = { onRotate, onHandDetected, onGrabChange, onError };
  }, [onRotate, onHandDetected, onGrabChange, onError]);
  
  useEffect(() => {
    if (!enabled) return;
    
    const video = videoEl.current;
    const canvas = canvasEl?.current ?? null;
    if (!video) return;
    
    let aborted = false;
    let stream: MediaStream | null = null;
    let landmarker: HandLandmarker | null = null;
    let rafId: number | null = null;
    
    // Hand state
    let detected = false;
    let grabbing = false;
    let smoothCx = 0.5;
    let smoothCy = 0.5;
    let prevCx = 0.5;
    let prevCy = 0.5;
    let velX = 0;
    let velY = 0;
    let pinchCount = 0;
    let lastVideoTime = -1;
    let frameCounter = 0;
    const PROCESS_EVERY_N_FRAMES = 3; // Process every 2nd frame for better performance
    
    const wrap360 = (deg: number) => {
      const m = deg % 360;
      return m < 0 ? m + 360 : m;
    };
    
    const clamp = (val: number, min: number, max: number) => 
      Math.max(min, Math.min(max, val));
    
    const drawHand = (hand: Array<{ x: number; y: number }>) => {
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Key points
      const pts = [0, 4, 8, 12, 16, 20];
      ctx.fillStyle = "rgba(74, 222, 128, 0.9)";
      for (const i of pts) {
        ctx.beginPath();
        ctx.arc(hand[i].x * canvas.width, hand[i].y * canvas.height, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Pinch line
      const thumb = hand[4];
      const index = hand[8];
      ctx.strokeStyle = grabbing ? "#f97316" : "#94a3b8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(thumb.x * canvas.width, thumb.y * canvas.height);
      ctx.lineTo(index.x * canvas.width, index.y * canvas.height);
      ctx.stroke();
    };
    
    const processFrame = () => {
      if (!landmarker || !video) return;
      if (video.readyState < 2) return;
      if (video.currentTime === lastVideoTime) return;
      
      lastVideoTime = video.currentTime;
      
      // Skip frames for better camera performance
      frameCounter++;
      if (frameCounter % PROCESS_EVERY_N_FRAMES !== 0) return;
      
      try {
        const result = landmarker.detectForVideo(video, performance.now());
        const handFound = !!(result.landmarks?.length);
        
        if (handFound) {
          const hand = result.landmarks[0];
          
          if (!detected) {
            detected = true;
            callbacksRef.current.onHandDetected?.(true);
          }
          
          // Hand center
          const wrist = hand[0];
          const mid = hand[9];
          const pinky = hand[17];
          const cx = (wrist.x + mid.x + pinky.x) / 3;
          const cy = (wrist.y + mid.y + pinky.y) / 3;
          
          // Smooth
          smoothCx += (cx - smoothCx) * 0.4;
          smoothCy += (cy - smoothCy) * 0.4;
          
          // Pinch
          const thumb = hand[4];
          const index = hand[8];
          const dist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
          const isPinching = dist < pinchThreshold;
          
          // Debounce
          if (isPinching) {
            pinchCount = Math.min(pinchCount + 1, 3);
          } else {
            pinchCount = Math.max(pinchCount - 1, 0);
          }
          
          const rot = rotationRef.current;
          
          // Grab on
          if (pinchCount >= 2 && !grabbing) {
            grabbing = true;
            callbacksRef.current.onGrabChange?.(true);
            prevCx = smoothCx;
            prevCy = smoothCy;
            velX = 0;
            velY = 0;
          }
          
          // Grab off
          if (pinchCount === 0 && grabbing) {
            grabbing = false;
            callbacksRef.current.onGrabChange?.(false);
          }
          
          if (grabbing) {
            const dx = smoothCx - prevCx;
            const dy = smoothCy - prevCy;
            prevCx = smoothCx;
            prevCy = smoothCy;
            
            const rotY = dx * degPerNormX;
            const rotX = -dy * degPerNormY;
            
            velY = rotY;
            velX = rotX;
            
            let newRy = wrap360(rot.ry + rotY);
            let newRx = rot.rx + rotX;
            
            if (clampX > 0) {
              newRx = clamp(newRx, -clampX, clampX);
            }
            
            callbacksRef.current.onRotate(newRx, newRy);
          } else {
            // Inertia
            const speed = Math.abs(velX) + Math.abs(velY);
            if (speed > 0.05) {
              velX *= 0.93;
              velY *= 0.93;
              
              let newRy = wrap360(rot.ry + velY);
              let newRx = rot.rx + velX;
              
              if (clampX > 0) {
                newRx = clamp(newRx, -clampX, clampX);
              }
              
              callbacksRef.current.onRotate(newRx, newRy);
            } else {
              velX = 0;
              velY = 0;
            }
          }
          
          drawHand(hand);
        } else {
          if (detected) {
            detected = false;
            callbacksRef.current.onHandDetected?.(false);
          }
          if (grabbing) {
            grabbing = false;
            callbacksRef.current.onGrabChange?.(false);
          }
          pinchCount = 0;
          
          if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      } catch (err) {
        console.warn("[Hand] Frame error:", err);
      }
    };
    
    const loop = () => {
      if (aborted) return;
      rafId = requestAnimationFrame(loop);
      processFrame();
    };
    
    const init = async () => {
      try {
        // Get camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user", 
            width: { ideal: 160 },    // Reduced from 320
            height: { ideal: 120 },   // Reduced from 240  
            frameRate: { ideal: 20, max: 30 }  // Lower frame rate
          },
          audio: false,
        });
        
        if (aborted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        
        // Wait for video
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Timeout")), 8000);
          
          const check = () => {
            if (aborted) {
              clearTimeout(timeout);
              reject(new Error("Aborted"));
              return;
            }
            
            if (video.readyState >= 2 && video.videoWidth > 0) {
              clearTimeout(timeout);
              resolve();
            } else {
              requestAnimationFrame(check);
            }
          };
          
          video.addEventListener("loadeddata", () => {
            clearTimeout(timeout);
            resolve();
          }, { once: true });
          
          video.play().catch(() => {});
          check();
        });
        
        if (aborted) return;
        
        // Set canvas size
        if (canvas && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }
        
        // Load MediaPipe
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        
        if (aborted) return;
        
        landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,  // Lowered from 0.7 for speed
          minHandPresenceConfidence: 0.5,   // Lowered from 0.7 for speed
          minTrackingConfidence: 0.5,       // Lowered from 0.7 for speed
        });
        
        if (aborted) {
          landmarker.close();
          return;
        }
        
        // Start loop
        rafId = requestAnimationFrame(loop);
        
      } catch (err) {
        if (!aborted) {
          const msg = err instanceof Error ? err.message : "Camera failed";
          callbacksRef.current.onError?.(msg);
        }
      }
    };
    
    init();
    
    // CLEANUP
    return () => {
      aborted = true;
      
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      
      if (landmarker) {
        try {
          landmarker.close();
        } catch (e) {
          console.warn("[Hand] Landmarker close error:", e);
        }
        landmarker = null;
      }
      
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        stream = null;
      }
      
      if (video) {
        video.pause();
        video.srcObject = null;
      }
      
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      callbacksRef.current.onHandDetected?.(false);
      callbacksRef.current.onGrabChange?.(false);
    };
  }, [enabled, videoEl, canvasEl, rotationRef, pinchThreshold, degPerNormX, degPerNormY, clampX]);
}