import { useEffect, useRef } from "react";
// Full MediaPipe Hands SDK - often better performance than Hand Landmarker
// npm install @mediapipe/hands @mediapipe/camera_utils

import { Hands, type Results } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

type Params = {
  enabled: boolean;
  videoEl: React.RefObject<HTMLVideoElement | null>;
  canvasEl?: React.RefObject<HTMLCanvasElement | null>;
  onRotate: (rx: number, ry: number) => void;
  onHandDetected?: (detected: boolean) => void;
  onError?: (msg: string) => void;
};

/**
 * MediaPipe Hands FULL SDK implementation
 * Often provides better real-time performance than Hand Landmarker
 * 
 * INSTALLATION:
 * npm install @mediapipe/hands @mediapipe/camera_utils
 */
export function useHandControlMediaPipeSDK({ 
  enabled, 
  videoEl, 
  canvasEl,
  onRotate, 
  onHandDetected,
  onError 
}: Params) {
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const initializingRef = useRef(false);
  
  const lastPosition = useRef({ rx: 0, ry: 0 });
  const enabledRef = useRef(enabled);
  const handVisibleCount = useRef(0);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    const cleanup = () => {
      if (cameraRef.current) {
        try {
          cameraRef.current.stop();
        } catch (e) {
          console.warn("Camera stop error:", e);
        }
        cameraRef.current = null;
      }

      if (handsRef.current) {
        try {
          handsRef.current.close();
        } catch (e) {
          console.warn("Hands close error:", e);
        }
        handsRef.current = null;
      }

      if (canvasEl?.current) {
        const ctx = canvasEl.current.getContext("2d");
        ctx?.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
      }

      initializingRef.current = false;
      handVisibleCount.current = 0;
    };

    if (!enabled) {
      cleanup();
      return;
    }

    if (initializingRef.current || handsRef.current) {
      return;
    }
    
    initializingRef.current = true;

    const run = async () => {
      try {
        const video = videoEl.current;
        if (!video) {
          throw new Error("Video element not mounted");
        }

        // Initialize MediaPipe Hands
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0, // 0 = lite (fastest), 1 = full (balanced)
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
          selfieMode: true // Mirror for user-facing camera
        });

        // Set up result handler - THIS IS WHERE THE MAGIC HAPPENS
        // This callback fires immediately when results are ready
        hands.onResults((results: Results) => {
          if (!enabledRef.current) return;

          const handDetected = results.multiHandLandmarks && results.multiHandLandmarks.length > 0;

          if (handDetected) {
            const landmarks = results.multiHandLandmarks[0];
            handVisibleCount.current = Math.min(handVisibleCount.current + 1, 5);

            // Draw on canvas if available
            if (canvasEl?.current) {
              const ctx = canvasEl.current.getContext("2d");
              if (ctx) {
                ctx.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);

                // Draw key points
                ctx.fillStyle = "#4ade80";
                [0, 4, 8, 12, 16, 20].forEach(i => {
                  const point = landmarks[i];
                  ctx.beginPath();
                  ctx.arc(point.x * canvasEl.current!.width, point.y * canvasEl.current!.height, 8, 0, 2 * Math.PI);
                  ctx.fill();
                });
              }
            }

            // Calculate hand position
            const wrist = landmarks[0];
            const middleBase = landmarks[9];
            const pinkyBase = landmarks[17];

            const cx = (wrist.x + middleBase.x + pinkyBase.x) / 3;
            const cy = (wrist.y + middleBase.y + pinkyBase.y) / 3;

            // Direct mapping for instant response
            const targetRy = (cx - 0.5) * 200;
            const targetRx = (cy - 0.5) * -160;

            // Minimal smoothing
            const alpha = 0.5;
            lastPosition.current.ry = lastPosition.current.ry * (1 - alpha) + targetRy * alpha;
            lastPosition.current.rx = lastPosition.current.rx * (1 - alpha) + targetRx * alpha;

            // Update rotation IMMEDIATELY
            onRotate(lastPosition.current.rx, lastPosition.current.ry);

            if (handVisibleCount.current >= 2) {
              onHandDetected?.(true);
            }

          } else {
            handVisibleCount.current = Math.max(handVisibleCount.current - 1, 0);

            if (handVisibleCount.current === 0) {
              onHandDetected?.(false);
              
              if (canvasEl?.current) {
                const ctx = canvasEl.current.getContext("2d");
                ctx?.clearRect(0, 0, canvasEl.current.width, canvasEl.current.height);
              }
            }
          }
        });

        handsRef.current = hands;

        // Set up camera - this handles all the frame capture automatically
        const camera = new Camera(video, {
          onFrame: async () => {
            if (handsRef.current && enabledRef.current) {
              await handsRef.current.send({ image: video });
            }
          },
          width: 640,
          height: 480,
          facingMode: "user"
        });

        cameraRef.current = camera;

        // Set canvas size
        if (canvasEl?.current && video) {
          await new Promise<void>((resolve) => {
            const checkSize = () => {
              if (video.videoWidth > 0 && video.videoHeight > 0) {
                canvasEl.current!.width = video.videoWidth;
                canvasEl.current!.height = video.videoHeight;
                resolve();
              } else {
                setTimeout(checkSize, 50);
              }
            };
            checkSize();
          });
        }

        // Start the camera - this begins the real-time processing
        await camera.start();

        initializingRef.current = false;
        console.log("✅ MediaPipe Hands SDK initialized");

      } catch (e) {
        const msg = e instanceof Error ? e.message : "Hand control failed";
        onError?.(msg);
        initializingRef.current = false;
      }
    };

    run();

    return cleanup;
  }, [enabled, videoEl, canvasEl, onRotate, onHandDetected, onError]);
}