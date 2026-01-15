import { useEffect, useRef } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

type Rotation = { rx: number; ry: number };

type Params = {
  enabled: boolean;
  videoEl: React.RefObject<HTMLVideoElement | null>;
  canvasEl?: React.RefObject<HTMLCanvasElement | null>;

  // Important: pass current rotation via ref so hand starts from your cube's current state
  rotationRef: React.RefObject<Rotation>;

  // update the same rotateX/rotateY state you already use
  onRotate: (rx: number, ry: number) => void;

  onHandDetected?: (detected: boolean) => void;
  onGrabChange?: (grabbing: boolean) => void;
  onError?: (msg: string) => void;

  // tuning
  pinchThreshold?: number; // normalized distance, smaller = harder pinch
  degPerNormX?: number; // left right -> Y degrees
  degPerNormY?: number; // up down -> X degrees
  clampX?: number; // 0 disables clamp, else clamps to [-clampX, +clampX]
  inertiaFriction?: number; // 0..1, higher = longer spin
  smoothing?: number; // 0..1, higher = smoother
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

  pinchThreshold = 0.05,
  degPerNormX = 520,
  degPerNormY = 420,
  clampX = 80,
  inertiaFriction = 0.92,
  smoothing = 0.35,
}: Params) {
  const enabledRef = useRef(enabled);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const initTokenRef = useRef(0);
  const processingRef = useRef(false);

  const onRotateRef = useRef(onRotate);
  const onDetectedRef = useRef(onHandDetected);
  const onGrabRef = useRef(onGrabChange);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onRotateRef.current = onRotate;
  }, [onRotate]);

  useEffect(() => {
    onDetectedRef.current = onHandDetected;
  }, [onHandDetected]);

  useEffect(() => {
    onGrabRef.current = onGrabChange;
  }, [onGrabChange]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    const stopAll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch {
          // ignore
        }
        landmarkerRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const v = videoEl.current;
      if (v) v.srcObject = null;

      const c = canvasEl?.current;
      if (c) {
        const ctx = c.getContext("2d");
        ctx?.clearRect(0, 0, c.width, c.height);
      }

      processingRef.current = false;
    };

    if (!enabled) {
      stopAll();
      onDetectedRef.current?.(false);
      onGrabRef.current?.(false);
      return;
    }

    initTokenRef.current += 1;
    const myToken = initTokenRef.current;

    const run = async () => {
      try {
        const v = videoEl.current;
        if (!v) throw new Error("Video element not mounted");

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 320 },
            height: { ideal: 180 },
          },
          audio: false,
        });

        if (initTokenRef.current !== myToken) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        v.srcObject = stream;
        v.muted = true;
        v.playsInline = true;

        await new Promise<void>((resolve, reject) => {
          const startedAt = performance.now();

          const tick = async () => {
            if (initTokenRef.current !== myToken) return reject(new Error("Cancelled"));

            if (v.paused) {
              try {
                await v.play();
              } catch {
                // ignore
              }
            }

            const ready = v.readyState >= 2 && v.videoWidth > 0 && v.videoHeight > 0;
            if (ready) return resolve();

            if (performance.now() - startedAt > 10000) {
              return reject(new Error("Video did not become ready in time"));
            }

            requestAnimationFrame(tick);
          };

          tick();
        });

        if (canvasEl?.current) {
          canvasEl.current.width = v.videoWidth;
          canvasEl.current.height = v.videoHeight;
        }

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );

        const lm = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 1,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (initTokenRef.current !== myToken) {
          lm.close();
          return;
        }

        landmarkerRef.current = lm;

        let lastVideoTime = -1;

        // hand state
        let detected = false;
        let grabbing = false;

        // smoothed center so jitter is reduced
        let smoothCx = 0.5;
        let smoothCy = 0.5;

        // previous center for delta rotation
        let prevCx = 0.5;
        let prevCy = 0.5;

        // inertia velocity
        let velX = 0; // affects rx
        let velY = 0; // affects ry

        const wrap360 = (deg: number) => {
          const m = deg % 360;
          return m < 0 ? m + 360 : m;
        };

        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

        const draw = (hand: Array<{ x: number; y: number }>) => {
          const c = canvasEl?.current;
          if (!c) return;
          const ctx = c.getContext("2d");
          if (!ctx) return;

          ctx.clearRect(0, 0, c.width, c.height);

          const pts = [0, 4, 8, 12, 16, 20];
          ctx.fillStyle = "rgba(74, 222, 128, 0.9)";
          for (const i of pts) {
            const p = hand[i];
            ctx.beginPath();
            ctx.arc(p.x * c.width, p.y * c.height, 6, 0, Math.PI * 2);
            ctx.fill();
          }

          // pinch line
          const t = hand[4];
          const i = hand[8];
          ctx.strokeStyle = grabbing ? "rgba(249, 115, 22, 0.9)" : "rgba(148, 163, 184, 0.7)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(t.x * c.width, t.y * c.height);
          ctx.lineTo(i.x * c.width, i.y * c.height);
          ctx.stroke();
        };

        const loop = () => {
          if (!enabledRef.current) return;

          rafRef.current = requestAnimationFrame(loop);

          const v2 = videoEl.current;
          const lm2 = landmarkerRef.current;

          // ROI crash guards
          if (!v2 || !lm2) return;
          if (v2.readyState < 2) return;
          if (v2.videoWidth === 0 || v2.videoHeight === 0) return;

          if (v2.currentTime === lastVideoTime) return;
          lastVideoTime = v2.currentTime;

          if (processingRef.current) return;
          processingRef.current = true;

          try {
            const now = performance.now();
            const res = lm2.detectForVideo(v2, now);
            const found = !!(res.landmarks && res.landmarks.length);

            if (found) {
              const hand = res.landmarks![0];

              if (!detected) {
                detected = true;
                onDetectedRef.current?.(true);
              }

              // center (wrist + mid + pinky base)
              const wrist = hand[0];
              const mid = hand[9];
              const pinky = hand[17];
              const cx = (wrist.x + mid.x + pinky.x) / 3;
              const cy = (wrist.y + mid.y + pinky.y) / 3;

              // pinch (thumb tip 4, index tip 8)
              const thumb = hand[4];
              const index = hand[8];
              const pinchDist = Math.hypot(thumb.x - index.x, thumb.y - index.y);
              const isPinching = pinchDist < pinchThreshold;

              // smooth center
              smoothCx = smoothCx + (cx - smoothCx) * smoothing;
              smoothCy = smoothCy + (cy - smoothCy) * smoothing;

              const rot = rotationRef.current;

              if (isPinching && !grabbing) {
                grabbing = true;
                onGrabRef.current?.(true);

                prevCx = smoothCx;
                prevCy = smoothCy;

                velX = 0;
                velY = 0;
              }

              if (!isPinching && grabbing) {
                grabbing = false;
                onGrabRef.current?.(false);
                // inertia continues using velX/velY
              }

              if (grabbing) {
                const dx = smoothCx - prevCx;
                const dy = smoothCy - prevCy;

                prevCx = smoothCx;
                prevCy = smoothCy;

                // convert movement to degrees
                const addY = dx * degPerNormX;
                const addX = -dy * degPerNormY;

                // velocity for inertia
                velY = velY * 0.6 + addY * 0.4;
                velX = velX * 0.6 + addX * 0.4;

                let nextRy = rot.ry + addY;
                let nextRx = rot.rx + addX;

                nextRy = wrap360(nextRy);

                if (clampX > 0) {
                  nextRx = clamp(nextRx, -clampX, clampX);
                }

                onRotateRef.current(nextRx, nextRy);
              } else {
                // apply inertia only when not grabbing
                const speed = Math.abs(velX) + Math.abs(velY);
                if (speed > 0.02) {
                  velX *= inertiaFriction;
                  velY *= inertiaFriction;

                  let nextRy = rot.ry + velY;
                  let nextRx = rot.rx + velX;

                  nextRy = wrap360(nextRy);

                  if (clampX > 0) {
                    nextRx = clamp(nextRx, -clampX, clampX);
                  }

                  onRotateRef.current(nextRx, nextRy);
                } else {
                  velX = 0;
                  velY = 0;
                }
              }

              draw(hand as any);
            } else {
              if (detected) {
                detected = false;
                onDetectedRef.current?.(false);
              }
              if (grabbing) {
                grabbing = false;
                onGrabRef.current?.(false);
              }

              const c = canvasEl?.current;
              if (c) c.getContext("2d")?.clearRect(0, 0, c.width, c.height);
            }
          } catch {
            // keep alive
          } finally {
            processingRef.current = false;
          }
        };

        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Hand control failed";
        onErrorRef.current?.(msg);
        stopAll();
      }
    };

    run();

    return stopAll;
  }, [
    enabled,
    videoEl,
    canvasEl,
    rotationRef,
    pinchThreshold,
    degPerNormX,
    degPerNormY,
    clampX,
    inertiaFriction,
    smoothing,
  ]);
}
