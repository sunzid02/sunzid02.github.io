import { useState } from "react";

type Props = {
  id: string;
  title?: string;
  pages: React.ReactNode[];
};

export default function FlipBookView({ id, title, pages }: Props) {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev" | "">("");

  const total = pages.length;
  const canPrev = index > 0;
  const canNext = index < total - 1;

  const handlePrev = () => {
    if (canPrev && !isFlipping) {
      setDirection("prev");
      setIsFlipping(true);
      setTimeout(() => {
        setIndex(index - 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const handleNext = () => {
    if (canNext && !isFlipping) {
      setDirection("next");
      setIsFlipping(true);
      setTimeout(() => {
        setIndex(index + 1);
        setIsFlipping(false);
      }, 600);
    }
  };

  const goToPage = (i: number) => {
    if (i !== index && !isFlipping) {
      setDirection(i > index ? "next" : "prev");
      setIsFlipping(true);
      setTimeout(() => {
        setIndex(i);
        setIsFlipping(false);
      }, 600);
    }
  };

  if (!pages?.length) return null;

  return (
    <div id={id} className="flipbook">
      <div className="flipbook-top">
        {title && <h3 className="flipbook-title">{title}</h3>}
        <div className="flipbook-actions">
          <button className="btn" onClick={handlePrev} disabled={!canPrev || isFlipping}>
            ← Prev
          </button>
          <button className="btn" onClick={handleNext} disabled={!canNext || isFlipping}>
            Next →
          </button>
        </div>
      </div>

      <div className="flipbook-stage">
        <div className="book-wrapper">
          {/* Current Page (Visible) */}
          <div className="book-page book-page-static">
            <div className="book-page-inner">{pages[index]}</div>
          </div>

          {/* Flipping Page (Animation) */}
          {isFlipping && (
            <div className={`book-page book-page-flip flip-${direction}`}>
              {/* Front side (current page) */}
              <div className="book-page-inner book-page-front">
                {pages[index]}
              </div>
              {/* Back side (next/prev page) */}
              <div className="book-page-inner book-page-back">
                {direction === "next" ? pages[index + 1] : pages[index - 1]}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flipbook-dots">
        {pages.map((_, i) => (
          <button
            key={`${id}-dot-${i}`}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => goToPage(i)}
            disabled={isFlipping}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>

      <div className="flipbook-counter">
        Page {index + 1} of {total}
      </div>
    </div>
  );
}