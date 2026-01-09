import { useEffect, useRef } from "react";

type Options = {
  onPrev: () => void;
  onNext: () => void;
  enabled?: boolean;
  swipeThresholdPx?: number;
};

export function useSliderControls({
  onPrev,
  onNext,
  enabled = true,
  swipeThresholdPx = 45,
}: Options) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    // Keyboard support (when the slider is focused)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    };

    // Swipe support (pointer events)
    let startX = 0;
    let startY = 0;
    let dragging = false;

    const onPointerDown = (e: PointerEvent) => {
      // Only left click or touch
      if (e.pointerType === "mouse" && e.button !== 0) return;

      dragging = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Ignore mostly vertical gestures (page scroll)
      if (Math.abs(dy) > Math.abs(dx)) return;

      if (dx > swipeThresholdPx) onPrev();
      if (dx < -swipeThresholdPx) onNext();
    };

    el.addEventListener("keydown", onKeyDown);
    el.addEventListener("pointerdown", onPointerDown, { passive: true });
    el.addEventListener("pointerup", onPointerUp, { passive: true });

    return () => {
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
    };
  }, [enabled, onPrev, onNext, swipeThresholdPx]);

  return ref;
}
