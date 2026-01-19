import type React from "react";
import type { MutableRefObject } from "react";

type Face = {
  title: string;
  badge?: string;
  items: string[];
};

type Side = 0 | 1 | 2 | 3 | 4 | 5;

type DragState = {
  x: number;
  y: number;
  rx: number;
  ry: number;
  on: boolean;
};

type Props = {
  rx: number;
  ry: number;
  active: Side;

  faces: Face[];
  drag: MutableRefObject<DragState>;

  handControl: boolean;
  handGrabbing: boolean;

  setIsInteracting: (v: boolean) => void;

  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: () => void;
};

export default function TechStageView({
  rx,
  ry,
  active,
  faces,
  drag,
  handControl,
  handGrabbing,
  setIsInteracting,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: Props) {
  return (
    <div className="tech-stage">
      <div
        className="scene"
        onMouseEnter={() => setIsInteracting(true)}
        onMouseLeave={() => setIsInteracting(false)}
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
              key={`${face.title}-${i}`}
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
  );
}
