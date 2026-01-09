import { useState } from "react";
import type { RecommendationItem } from "../../../../model/siteModel";
import "./recommendations.css";

type Props = {
  items: RecommendationItem[];
};

export default function RecommendationsSliderView({ items }: Props) {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const total = items.length;

  if (!items || items.length === 0) {
    return <p className="hint">No recommendations yet.</p>;
  }

  const canPrev = index > 0;
  const canNext = index < total - 1;

  const goPrev = () => {
    if (canPrev && !isAnimating) {
      setIsAnimating(true);
      setIndex(index - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const goNext = () => {
    if (canNext && !isAnimating) {
      setIsAnimating(true);
      setIndex(index + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const goTo = (i: number) => {
    if (i !== index && !isAnimating) {
      setIsAnimating(true);
      setIndex(i);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  // Get visible cards
  const getVisibleCards = () => {
    const cards = [];
    
    // Show prev card if exists
    if (index > 0) {
      cards.push({ item: items[index - 1], idx: index - 1, position: 'prev' });
    }
    
    // Current card (always show)
    cards.push({ item: items[index], idx: index, position: 'current' });
    
    // Show next card if exists
    if (index < total - 1) {
      cards.push({ item: items[index + 1], idx: index + 1, position: 'next' });
    }
    
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="recommendations-carousel">
      {/* Left Arrow */}
      <button
        className="rec-arrow rec-arrow-left"
        onClick={goPrev}
        disabled={!canPrev || isAnimating}
        aria-label="Previous recommendation"
      >
        ←
      </button>

      {/* Cards Track */}
      <div className="rec-track">
        {visibleCards.map(({ item, idx, position }) => {
          const isActive = position === 'current';

          return (
            <div
              key={idx}
              className={`rec-card ${isActive ? 'active' : 'side'}`}
              onClick={() => !isActive && !isAnimating && goTo(idx)}
            >
              {/* Header with photo and info */}
              <div className="rec-header">
                {item.photo ? (
                  <div className="rec-photo">
                    <img src={item.photo} alt={item.name} />
                  </div>
                ) : (
                  <div className="rec-photo rec-photo-placeholder">
                    <span>{item.name.charAt(0)}</span>
                  </div>
                )}
                
                <div className="rec-info">
                  <h3 className="rec-name">{item.name}</h3>
                  <p className="rec-role">{item.role}</p>
                  <p className="rec-company">{item.company}</p>
                </div>
              </div>

              {/* Quote icon */}
              <div className="rec-quote-icon">"</div>

              {/* Recommendation text */}
              <div className="rec-text">
                <p>{item.text}</p>
              </div>

              {/* LinkedIn link if available */}
              {item.linkedin && isActive && (
                <a 
                  href={item.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="rec-linkedin"
                  onClick={(e) => e.stopPropagation()}
                >
                  View on LinkedIn →
                </a>
              )}
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        className="rec-arrow rec-arrow-right"
        onClick={goNext}
        disabled={!canNext || isAnimating}
        aria-label="Next recommendation"
      >
        →
      </button>

      {/* Counter */}
      <div className="rec-counter">
        {index + 1} of {total}
      </div>

      {/* Dots Navigation */}
      <div className="rec-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`rec-dot ${i === index ? 'active' : ''}`}
            onClick={() => goTo(i)}
            disabled={isAnimating}
            aria-label={`Go to recommendation ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}