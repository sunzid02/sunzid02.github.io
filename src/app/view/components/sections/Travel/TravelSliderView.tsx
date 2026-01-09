import { useState } from "react";
import type { TravelPhoto } from "../../../../model/siteModel";

type Props = {
  items: TravelPhoto[];
};

export default function TravelSliderView({ items }: Props) {
  const [index, setIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev" | "">("");
  const [displayIndex, setDisplayIndex] = useState(0);

  const total = items.length;
  const canPrev = index > 0;
  const canNext = index < total - 1;

  const handlePrev = () => {
    if (canPrev && !isFlipping) {
      setDirection("prev");
      setIsFlipping(true);
      setDisplayIndex(index - 1);
      setTimeout(() => {
        setIndex(index - 1);
        setIsFlipping(false);
      }, 800);
    }
  };

  const handleNext = () => {
    if (canNext && !isFlipping) {
      setDirection("next");
      setIsFlipping(true);
      setTimeout(() => {
        setIndex(index + 1);
        setIsFlipping(false);
      }, 800);
    }
  };

  const goToPage = (i: number) => {
    if (i !== index && !isFlipping) {
      setDirection(i > index ? "next" : "prev");
      setIsFlipping(true);
      if (i < index) setDisplayIndex(i);
      setTimeout(() => {
        setIndex(i);
        setIsFlipping(false);
      }, 800);
    }
  };

  if (!items || items.length === 0) {
    return <p className="hint">No travel photos yet.</p>;
  }

  const current = items[index];
  const nextPage = direction === "next" && index + 1 < total ? items[index + 1] : null;
  const prevPage = direction === "prev" && displayIndex >= 0 ? items[displayIndex] : null;

  return (
    <div className="travel-book-container">
      {/* Navigation Controls */}
      <div className="travel-book-nav">
        <button
          className="travel-book-btn"
          onClick={handlePrev}
          disabled={!canPrev || isFlipping}
          aria-label="Previous photo"
        >
          ← Previous
        </button>
        <span className="travel-book-counter">
          {index + 1} / {total}
        </span>
        <button
          className="travel-book-btn"
          onClick={handleNext}
          disabled={!canNext || isFlipping}
          aria-label="Next photo"
        >
          Next →
        </button>
      </div>

      {/* Book Stage with 3D Perspective */}
      <div className="travel-book-stage">
        <div className="travel-book-wrapper">
          {/* Static Page (Current visible page) */}
          <div className="travel-book-page travel-book-page-static">
            <div className="travel-book-spread">
              {/* Left Page - Text/Info */}
              <div className="travel-book-left">
                <div className="travel-book-content">
                  <h3 className="travel-location">{current.title}</h3>
                  <div className="travel-story">
                    <p>{current.desc}</p>
                  </div>
                  <div className="travel-page-number">Page {index + 1}</div>
                </div>
              </div>

              {/* Right Page - Image */}
              <div className="travel-book-right">
                <div className="travel-image-container">
                  <img src={current.src} alt={current.title} loading="lazy" />
                </div>
              </div>
            </div>
          </div>

          {/* Flipping Page for NEXT */}
          {isFlipping && direction === "next" && nextPage && (
            <div className="travel-book-page travel-book-page-flip flip-next">
              {/* Front side (current page) */}
              <div className="travel-book-spread travel-book-front">
                <div className="travel-book-left">
                  <div className="travel-book-content">
                    <h3 className="travel-location">{current.title}</h3>
                    <div className="travel-story">
                      <p>{current.desc}</p>
                    </div>
                    <div className="travel-page-number">Page {index + 1}</div>
                  </div>
                </div>
                <div className="travel-book-right">
                  <div className="travel-image-container">
                    <img src={current.src} alt={current.title} loading="lazy" />
                  </div>
                </div>
              </div>

              {/* Back side (next page) */}
              <div className="travel-book-spread travel-book-back">
                <div className="travel-book-left">
                  <div className="travel-book-content">
                    <h3 className="travel-location">{nextPage.title}</h3>
                    <div className="travel-story">
                      <p>{nextPage.desc}</p>
                    </div>
                    <div className="travel-page-number">Page {index + 2}</div>
                  </div>
                </div>
                <div className="travel-book-right">
                  <div className="travel-image-container">
                    <img src={nextPage.src} alt={nextPage.title} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Flipping Page for PREV */}
          {isFlipping && direction === "prev" && prevPage && (
            <div className="travel-book-page travel-book-page-flip flip-prev">
              {/* Front side (previous page - this is what we see underneath) */}
              <div className="travel-book-spread travel-book-front">
                <div className="travel-book-left">
                  <div className="travel-book-content">
                    <h3 className="travel-location">{prevPage.title}</h3>
                    <div className="travel-story">
                      <p>{prevPage.desc}</p>
                    </div>
                    <div className="travel-page-number">Page {displayIndex + 1}</div>
                  </div>
                </div>
                <div className="travel-book-right">
                  <div className="travel-image-container">
                    <img src={prevPage.src} alt={prevPage.title} loading="lazy" />
                  </div>
                </div>
              </div>

              {/* Back side (current page being flipped away) */}
              <div className="travel-book-spread travel-book-back">
                <div className="travel-book-left">
                  <div className="travel-book-content">
                    <h3 className="travel-location">{current.title}</h3>
                    <div className="travel-story">
                      <p>{current.desc}</p>
                    </div>
                    <div className="travel-page-number">Page {index + 1}</div>
                  </div>
                </div>
                <div className="travel-book-right">
                  <div className="travel-image-container">
                    <img src={current.src} alt={current.title} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Dots */}
      <div className="travel-book-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`travel-dot ${i === index ? "is-active" : ""}`}
            onClick={() => goToPage(i)}
            disabled={isFlipping}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}