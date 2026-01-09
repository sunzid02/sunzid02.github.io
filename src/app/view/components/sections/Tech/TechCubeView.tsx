import {  useRef, useState } from "react";
import type { TechModel } from "../../../../model/siteModel";
// import CardView from "../../ui/Card/CardView";
import { useCubeAutoRotate } from "../../../hooks/useCubeAutoRotate";

type Props = { tech: TechModel };

type Side = 0 | 1 | 2 | 3 | 4 | 5;

export default function TechCubeView({ tech }: Props) {
  const faces = tech.faces.slice(0, 6);

  const [rx, setRx] = useState(-15);
  const [ry, setRy] = useState(25);
  const [active, setActive] = useState<Side>(0);
  const [isDragging] = useState(false);

  const [autoRotate, setAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);

  useCubeAutoRotate({
    enabled: autoRotate && !isInteracting,
    speedDegPerSec: 10, // slow + premium
    onRotate: (delta) => setRy((v) => v + delta),
  });

  const onPointerDown = (e: React.PointerEvent) => {
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


  const drag = useRef<{ x: number; y: number; rx: number; ry: number; on: boolean }>({
    x: 0,
    y: 0,
    rx: -15,
    ry: 25,
    on: false,
  });

  const snapTo = (side: Side) => {
    setActive(side);

    const presets: Record<Side, { rx: number; ry: number }> = {
      0: { rx: -15, ry: 0 },      // front
      1: { rx: -15, ry: -90 },    // right
      2: { rx: -15, ry: -180 },   // back
      3: { rx: -15, ry: 90 },     // left
      4: { rx: -90, ry: 0 },      // top
      5: { rx: 90, ry: 0 },       // bottom
    };

    setRx(presets[side].rx);
    setRy(presets[side].ry);
  };

 

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;

    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;

    const nextRy = drag.current.ry + dx * 0.4;
    const nextRx = drag.current.rx - dy * 0.3;

    setRy(nextRy);
    setRx(nextRx);
  };

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


      </div>

      <div className="tech-stage">
        <div className="scene"   onMouseEnter={() => setIsInteracting(true)}
          onMouseLeave={() => setIsInteracting(false)}
      >
          <div
            className="tech-cube"
            style={{
              transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
              transition: isDragging ? "none" : "transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)",
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

        <p className="tech-tip">Drag the cube to rotate • Click tabs to view each side</p>
      </div>
    </div>
  );
}