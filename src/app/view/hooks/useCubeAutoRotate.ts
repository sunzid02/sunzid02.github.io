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
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const onRotateRef = useRef(onRotate);
  
  // Keep callback ref up to date
  useEffect(() => {
    onRotateRef.current = onRotate;
  }, [onRotate]);

  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    if (prefersReducedMotion) {
      return;
    }

    const loop = (currentTime: number) => {
      if (lastTimeRef.current !== null) {
        const deltaTime = (currentTime - lastTimeRef.current) / 1000;
        onRotateRef.current(speedDegPerSec * deltaTime);
      }
      lastTimeRef.current = currentTime;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [enabled, speedDegPerSec]); // ← REMOVED onRotate from dependencies
}