import { useEffect, useRef } from "react";

type Options = {
  enabled: boolean;
  speedDegPerSec?: number;
  onRotate: (deltaY: number) => void;
};

export function useCubeAutoRotate({
  enabled,
  speedDegPerSec = 6,
  onRotate,
}: Options) {
  const raf = useRef<number | null>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (prefersReducedMotion) return;

    const loop = (t: number) => {
      if (last.current != null) {
        const dt = (t - last.current) / 1000;
        onRotate(speedDegPerSec * dt);
      }
      last.current = t;
      raf.current = requestAnimationFrame(loop);
    };

    raf.current = requestAnimationFrame(loop);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = null;
      last.current = null;
    };
  }, [enabled, speedDegPerSec, onRotate]);
}
