import type React from "react";

type Props = {
  visible: boolean;

  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;

  handDetected: boolean;
  handGrabbing: boolean;
  handError: string | null;
};

export default function TechCameraView({
  visible,
  videoRef,
  canvasRef,
  handDetected,
  handGrabbing,
  handError,
}: Props) {
  if (!visible) return null;

  return (
    <div className="tech-camera">
      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          width={320}
          height={240}
          style={{
            width: 320,
            height: 240,
            borderRadius: 12,
            transform: "scaleX(-1)",
            pointerEvents: "none",
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 320,
            height: 240,
            borderRadius: 12,
            pointerEvents: "none",
            transform: "scaleX(-1)",
          }}
        />

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
          <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 500 }}>
            {handDetected ? (handGrabbing ? "Grabbing" : "Tracking") : "No hand"}
          </span>
        </div>

        {!handDetected && !handError && (
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

      {!handError && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 16px",
            backgroundColor: handDetected
              ? "rgba(74, 222, 128, 0.1)"
              : "rgba(148, 163, 184, 0.1)",
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
          <p style={{ margin: 0, color: "#ef4444", fontSize: "0.875rem", fontWeight: 500 }}>
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.18; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.35; transform: translate(-50%, -50%) scale(1.08); }
        }
      `}</style>
    </div>
  );
}
