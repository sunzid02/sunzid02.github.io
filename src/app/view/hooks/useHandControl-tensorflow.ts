import { useEffect, useRef } from "react";
import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";
import * as tf from "@tensorflow/tfjs-core";

type Params = {
  enabled: boolean;
  videoEl: React.RefObject<HTMLVideoElement | null>;
  canvasEl?: React.RefObject<HTMLCanvasElement | null>;
  onRotate: (rx: number, ry: number) => void;
  onHandDetected?: (detected: boolean) => void;
  onError?: (msg: string) => void;
};

/**
 * Alternative implementation using TensorFlow.js HandPose
 * Often more stable than MediaPipe for web applications
 * 
 * INSTALLATION:
 * npm install @tensorflow-models/handpose @tensorflow/tfjs-core @tensorflow/tfjs-backend-webgl
 */
export function useHandControlTensorFlow({ 
  enabled, 
  videoEl, 
  canvasEl,
  onRotate, 
  onHandDetected,
  onError 
}: Params) {
  const modelRef = useRef<handpose.HandPose | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const initializingRef = useRef(false);
  const smooth = useRef({ rx: 0, ry: 0 });
  const enabledRef = useRef(enabled);
  
  const lastHandState = useRef<boolean>(false);
  const consecutiveNoHandFrames = useRef(0);
  const consecutiveHandFrames = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const cleanup = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }

      modelRef.current = null;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      if (videoEl.current) {
        videoEl.current.srcObject = null;
      }

      if (canvasEl?.current) {
        const ctx = canvasEl.current.getContext("2d");
        ctx?.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
      }

      initializingRef.current = false;
      lastHandState.current = false;
      consecutiveNoHandFrames.current = 0;
      consecutiveHandFrames.current = 0;
    };

    if (!enabled) {
      cleanup();
      return;
    }

    if (initializingRef.current || modelRef.current) {
      return;
    }
    
    initializingRef.current = true;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const drawHandKeypoints = (
      ctx: CanvasRenderingContext2D,
      predictions: any[],
      width: number,
      height: number
    ) => {
      ctx.clearRect(0, 0, width, height);

      if (predictions.length === 0) return;

      const hand = predictions[0];
      const landmarks = hand.landmarks;

      // Draw connections
      const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring
        [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
        [5, 9], [9, 13], [13, 17] // Palm
      ];

      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";

      connections.forEach(([start, end]) => {
        const [x1, y1] = landmarks[start];
        const [x2, y2] = landmarks[end];
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Draw keypoints
      landmarks.forEach((landmark: number[], i: number) => {
        const [x, y] = landmark;
        
        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 8 : 5, 0, 2 * Math.PI);
        ctx.fillStyle = i === 0 ? "#f97316" : "#4ade80";
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    const run = async () => {
      try {
        const video = videoEl.current;
        if (!video) {
          throw new Error("Video element not mounted");
        }

        // Initialize TensorFlow backend
        await tf.ready();
        await tf.setBackend("webgl");

        // Get camera stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false,
        });
        streamRef.current = stream;

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;

        // Wait for video ready
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Video timeout")), 10000);
          
          const checkReady = () => {
            if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
              clearTimeout(timeout);
              
              if (canvasEl?.current) {
                canvasEl.current.width = video.videoWidth;
                canvasEl.current.height = video.videoHeight;
              }
              
              resolve();
            } else {
              requestAnimationFrame(checkReady);
            }
          };

          video.addEventListener("loadedmetadata", checkReady, { once: true });
          
          if (video.readyState >= 1) {
            checkReady();
          }
        });

        if (video.paused) {
          await video.play();
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        // Load HandPose model
        const model = await handpose.load({
          maxContinuousChecks: 20,
          detectionConfidence: 0.8,
          iouThreshold: 0.3,
          scoreThreshold: 0.5,
        });

        modelRef.current = model;
        initializingRef.current = false;

        let lastTimestamp = 0;
        const targetFPS = 25;
        const minFrameTime = 1000 / targetFPS;
        
        const FRAMES_TO_CONFIRM_HAND = 3;
        const FRAMES_TO_CONFIRM_NO_HAND = 10;

        const loop = async (timestamp: number) => {
          if (!enabledRef.current) {
            return;
          }

          rafRef.current = requestAnimationFrame(loop);

          if (timestamp - lastTimestamp < minFrameTime) {
            return;
          }
          lastTimestamp = timestamp;

          const model = modelRef.current;
          const v = videoEl.current;
          
          if (!model || !v || v.videoWidth === 0 || v.videoHeight === 0) {
            return;
          }

          try {
            // Detect hands
            const predictions = await model.estimateHands(v);
            
            const handDetectedThisFrame = predictions.length > 0;

            if (handDetectedThisFrame) {
              const hand = predictions[0];
              const landmarks = hand.landmarks;

              consecutiveHandFrames.current++;
              consecutiveNoHandFrames.current = 0;

              // Draw visualization
              if (canvasEl?.current) {
                const ctx = canvasEl.current.getContext("2d");
                if (ctx) {
                  drawHandKeypoints(ctx, predictions, v.videoWidth, v.videoHeight);
                }
              }

              // Calculate hand center (wrist, middle finger base, pinky base)
              const wrist = landmarks[0];
              const middleBase = landmarks[9];
              const pinkyBase = landmarks[17];

              const cx = (wrist[0] + middleBase[0] + pinkyBase[0]) / 3 / v.videoWidth;
              const cy = (wrist[1] + middleBase[1] + pinkyBase[1]) / 3 / v.videoHeight;

              const targetRy = (cx - 0.5) * 180;
              const targetRx = (cy - 0.5) * -150;

              smooth.current.ry = lerp(smooth.current.ry, targetRy, 0.15);
              smooth.current.rx = lerp(smooth.current.rx, targetRx, 0.15);

              onRotate(smooth.current.rx, smooth.current.ry);

              if (consecutiveHandFrames.current >= FRAMES_TO_CONFIRM_HAND && !lastHandState.current) {
                lastHandState.current = true;
                onHandDetected?.(true);
              }
            } else {
              consecutiveNoHandFrames.current++;
              consecutiveHandFrames.current = 0;

              if (consecutiveNoHandFrames.current >= FRAMES_TO_CONFIRM_NO_HAND) {
                if (canvasEl?.current && lastHandState.current) {
                  const ctx = canvasEl.current.getContext("2d");
                  ctx?.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
                }
                
                if (lastHandState.current) {
                  lastHandState.current = false;
                  onHandDetected?.(false);
                }
              }
            }
          } catch (err) {
            console.warn("Detection frame error:", err);
          }
        };

        rafRef.current = requestAnimationFrame(loop);

      } catch (e) {
        const msg = e instanceof Error ? e.message : "Hand control failed to start";
        onError?.(msg);
        initializingRef.current = false;
      }
    };

    run();

    return cleanup;
  }, [enabled, videoEl, canvasEl, onRotate, onHandDetected, onError]);
}