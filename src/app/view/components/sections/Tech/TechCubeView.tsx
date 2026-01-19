import { useCallback, useEffect, useRef, useState } from "react";
import type { TechModel } from "../../../../model/siteModel";
import { useCubeAutoRotate } from "../../../hooks/useCubeAutoRotate";
import { useHandControl } from "../../../hooks/useHandControl";
import TechCameraView from "./TechCameraView";
import TechStageView from "./TechStageView";


type Props = { tech: TechModel };
type Side = 0 | 1 | 2 | 3 | 4 | 5;

export default function TechCubeView({ tech }: Props) {
  const faces = tech.faces.slice(0, 6);

  const [rx, setRx] = useState(-15);
  const [ry, setRy] = useState(25);
  const [active, setActive] = useState<Side>(0);

  const [autoRotate, setAutoRotate] = useState(true);
  const [isInteracting, setIsInteracting] = useState(false);
  const [handControl, setHandControl] = useState(false);

  const [handError, setHandError] = useState<string | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const [handGrabbing, setHandGrabbing] = useState(false);

  const handVideoRef = useRef<HTMLVideoElement | null>(null);
  const handCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // keep latest rotation for the hand hook (so it adds deltas on top of current cube angle)
  const rotationRef = useRef({ rx: -15, ry: 25 });
  useEffect(() => {
    rotationRef.current = { rx, ry };
  }, [rx, ry]);

  // Mouse drag state
  const drag = useRef<{ x: number; y: number; rx: number; ry: number; on: boolean }>({
    x: 0,
    y: 0,
    rx: -15,
    ry: 25,
    on: false,
  });

  // Auto rotation (only when not interacting and not using hand mode)
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
    setHandGrabbing(false);
    setHandDetected(false);
  }, []);

  // Hand control (pinch to grab)
  useHandControl({
    enabled: handControl && !isInteracting,
    videoEl: handVideoRef,
    canvasEl: handCanvasRef,
    rotationRef,
    onRotate: handleRotate,
    onHandDetected: handleDetected,
    onGrabChange: handleGrabChange,
    onError: handleHandError,

    // tuning (change if you want)
    pinchThreshold: 0.05,
    smoothing: 0.35,
    clampX: 80, // set 0 if you want full flip on X
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

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.on) return;

    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;

    const nextRy = drag.current.ry + dx * 0.4;
    const nextRx = drag.current.rx - dy * 0.3;

    setRy(nextRy);
    setRx(nextRx);
  };

  const snapTo = (side: Side) => {
    setActive(side);

    const presets: Record<Side, { rx: number; ry: number }> = {
      0: { rx: -15, ry: 0 }, // front
      1: { rx: -15, ry: -90 }, // right
      2: { rx: -15, ry: -180 }, // back
      3: { rx: -15, ry: 90 }, // left
      4: { rx: -90, ry: 0 }, // top
      5: { rx: 90, ry: 0 }, // bottom
    };

    setRx(presets[side].rx);
    setRy(presets[side].ry);
  };

  const toggleHandControl = () => {
    setHandError(null);
    setHandDetected(false);
    setHandGrabbing(false);
    setHandControl((v) => !v);
  };

  // const showPreview = handControl; // keep mounted always, just fade it

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

      <TechStageView
        rx={rx}
        ry={ry}
        active={active}
        faces={faces}
        drag={drag}
        handControl={handControl}
        handGrabbing={handGrabbing}
        setIsInteracting={setIsInteracting}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />


      <TechCameraView
          visible={handControl}
          videoRef={handVideoRef}
          canvasRef={handCanvasRef}
          handDetected={handDetected}
          handGrabbing={handGrabbing}
          handError={handError}
        />



    </div>
  );
}
