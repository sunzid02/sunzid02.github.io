import { useCallback, useEffect, useRef, useState } from "react";
import type { TechModel } from "../../../../model/siteModel";
import { useCubeAutoRotate } from "../../../hooks/useCubeAutoRotate";
import { useHandControl } from "../../../hooks/useHandControl";

type Props = { tech: TechModel };
type Side = 0 | 1 | 2 | 3 | 4 | 5;

export default function TechCubeView({ tech }: Props) {
  const faces = tech.faces.slice(0, 6);

  const [rx, setRx] = useState(-15);
  const [ry, setRy] = useState(25);
  const [active, setActive] = useState<Side>(0);

  const [autoRotate, setAutoRotate] = useState(false);  // Changed from true
  const [isInteracting, setIsInteracting] = useState(false);
  const [handControl, setHandControl] = useState(false);

  const [handError, setHandError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [handGrabbing, setHandGrabbing] = useState(false);

  const handVideoRef = useRef<HTMLVideoElement | null>(null);
  const handCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const rotationRef = useRef({ rx: -15, ry: 25 });
  useEffect(() => {
    rotationRef.current = { rx, ry };
  }, [rx, ry]);

  const drag = useRef<{ x: number; y: number; rx: number; ry: number; on: boolean }>({
    x: 0,
    y: 0,
    rx: -15,
    ry: 25,
    on: false,
  });

  useCubeAutoRotate({
    enabled: autoRotate && !isInteracting && !handControl,
    speedDegPerSec: 10,
    onRotate: (delta) => setRy((v) => v + delta),
  });

  const handleRotate = useCallback((nextRx: number, nextRy: number) => {
    setRx(nextRx);
    setRy(nextRy);
  }, []);

  const handleDetected = useCallback((detected: boolean) => {
    setHandDetected(detected);
  }, []);

  const handleGrabChange = useCallback((grabbing: boolean) => {
    setHandGrabbing(grabbing);
  }, []);

  const handleHandError = useCallback((msg: string) => {
    setHandError(msg);
    setHandControl(false);
  }, []);

  useHandControl({
    enabled: handControl,  // ← REMOVED !isInteracting
    videoEl: handVideoRef,
    canvasEl: handCanvasRef,
    rotationRef,
    onRotate: handleRotate,
    onHandDetected: handleDetected,
    onGrabChange: handleGrabChange,
    onError: handleHandError,
    pinchThreshold: 0.05,
    smoothing: 0.35,
    clampX: 80,
  });

  const onPointerDown = (e: React.PointerEvent) => {
    // Don't allow mouse dragging when hand control is active
    if (handControl) return;
    
    const el = e.currentTarget as HTMLDivElement;
    el.setPointerCapture(e.pointerId);
    setIsInteracting(true);
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      rx,
      ry,
      on: true,
    };
  };

  const onPointerUp = () => {
    drag.current.on = false;
    setIsInteracting(false);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    setRy(drag.current.ry + dx * 0.4);
    setRx(drag.current.rx - dy * 0.3);
  };

  const snapTo = (side: Side) => {
    setActive(side);
    const presets: Record<Side, { rx: number; ry: number }> = {
      0: { rx: -15, ry: 0 },
      1: { rx: -15, ry: -90 },
      2: { rx: -15, ry: -180 },
      3: { rx: -15, ry: 90 },
      4: { rx: -90, ry: 0 },
      5: { rx: 90, ry: 0 },
    };
    setRx(presets[side].rx);
    setRy(presets[side].ry);
  };

  const toggleHandControl = () => {
    const willEnable = !handControl;
    
    console.log(`[TechCubeView] Toggle button clicked: ${handControl} -> ${willEnable}`);
    
    if (!willEnable) {
      // Turning off - reset states
      console.log("[TechCubeView] Turning OFF hand control");
      setHandDetected(false);
      setHandGrabbing(false);
      setHandError(null);
    } else {
      // Turning on - clear previous errors
      console.log("[TechCubeView] Turning ON hand control");
      setHandError(null);
    }
    
    setHandControl(willEnable);
  };
  
  // Log state changes
  useEffect(() => {
    console.log(`[TechCubeView] handControl state changed to: ${handControl}`);
  }, [handControl]);
  
  useEffect(() => {
    console.log(`[TechCubeView] isInteracting state changed to: ${isInteracting}`);
  }, [isInteracting]);

  return (
    <div className="tech-cube-wrap">
      <div className="tech-cube-tabs">
        {faces.map((f, i) => (
          <button
            key={f.title}
            type="button"
            className={`tech-tab ${active === (i as Side) ? "is-active" : ""}`}
            onClick={() => snapTo(i as Side)}
          >
            {f.title}
          </button>
        ))}

        <button type="button" className="tech-tab" onClick={() => snapTo(0)}>
          Reset
        </button>

        <button
          type="button"
          className={`tech-tab ${autoRotate ? "is-active" : ""}`}
          onClick={() => setAutoRotate((v) => !v)}
        >
          {autoRotate ? "Pause rotation" : "Auto rotate"}
        </button>

        <button
          type="button"
          className={`tech-tab ${handControl ? "is-active" : ""}`}
          onClick={toggleHandControl}
        >
          {handControl ? "Hand control on" : "Use hand 👋"}
        </button>
      </div>

      <div className="tech-stage">
        <div
          className="scene"
          onMouseEnter={() => !handControl && setIsInteracting(true)}
          onMouseLeave={() => !handControl && setIsInteracting(false)}
        >
          <div
            className="tech-cube"
            style={{
              transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
              transition: drag.current.on ? "none" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {faces.map((face, i) => (
              <div
                key={face.title}
                className={`tech-face tech-face-${i} ${active === i ? "is-active" : ""}`}
              >
                <div className="tech-face-inner">
                  <div className="tech-face-head">
                    <h3>{face.title}</h3>
                    {face.badge && <span className="tech-face-badge">{face.badge}</span>}
                  </div>
                  <div className="tech-face-items">
                    {face.items.map((it) => (
                      <span key={it} className="tech-chip">
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="tech-tip">
          {handControl
            ? handGrabbing
              ? "Pinch = grabbing. Move your hand to rotate."
              : "Pinch thumb + index to grab the cube."
            : "Drag the cube to rotate • Click tabs to view each side"}
        </p>
      </div>

      {handControl && 
      
        <div className="tech-camera">
          <div style={{ position: "relative", display: "inline-block" }}>
            <video
              ref={handVideoRef}
              playsInline
              muted
              style={{
                width: 320,
                height: 240,
                borderRadius: 12,
                transform: "scaleX(-1)",
                pointerEvents: "none",
                opacity: handControl ? 1 : 0,
                visibility: handControl ? "visible" : "hidden",
                transition: "opacity 0.2s ease, visibility 0.2s ease",
                backgroundColor: "#000",
              }}
            />

            <canvas
              ref={handCanvasRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 320,
                height: 240,
                borderRadius: 12,
                pointerEvents: "none",
                transform: "scaleX(-1)",
                opacity: handControl ? 1 : 0,
                visibility: handControl ? "visible" : "hidden",
                transition: "opacity 0.2s ease, visibility 0.2s ease",
              }}
            />

            {handControl && (
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 12px",
                  borderRadius: 20,
                  backgroundColor: "rgba(0, 0, 0, 0.7)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: handDetected ? "#4ade80" : "#ef4444",
                    boxShadow: handDetected ? "0 0 8px #4ade80" : "0 0 8px #ef4444",
                    transition: "all 0.3s ease",
                  }}
                />
                <span
                  style={{
                    color: "white",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {handDetected ? (handGrabbing ? "Grabbing" : "Tracking") : "No hand"}
                </span>
              </div>
            )}

            {handControl && !handDetected && !handError && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "4rem",
                  opacity: 0.25,
                  pointerEvents: "none",
                  animation: "pulse 2s ease-in-out infinite",
                }}
              >
                ✋
              </div>
            )}
          </div>

          {handControl && !handError && (
            <div
              style={{
                marginTop: 12,
                padding: "12px 16px",
                backgroundColor: handDetected ? "rgba(74, 222, 128, 0.1)" : "rgba(148, 163, 184, 0.1)",
                borderRadius: 8,
                border: `1px solid ${
                  handDetected ? "rgba(74, 222, 128, 0.3)" : "rgba(148, 163, 184, 0.3)"
                }`,
                transition: "all 0.3s ease",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: handDetected ? "#4ade80" : "#94a3b8",
                  fontWeight: 500,
                }}
              >
                {handDetected
                  ? handGrabbing
                    ? "✓ Grab active. Move hand to rotate."
                    : "✓ Hand detected. Pinch to grab."
                  : "Show your hand to the camera"}
              </p>

              {!handDetected && (
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    opacity: 0.85,
                  }}
                >
                  Make sure your hand is visible and well lit
                </p>
              )}
            </div>
          )}

          {handError && (
            <div
              style={{
                marginTop: 12,
                padding: "12px 16px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderRadius: 8,
                border: "1px solid rgba(239, 68, 68, 0.3)",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#ef4444",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                ⚠️ {handError}
              </p>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.75rem",
                  color: "#ef4444",
                  opacity: 0.85,
                }}
              >
                Please allow camera access to use hand control
              </p>
            </div>
          )}
        </div>
      }

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.18; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}