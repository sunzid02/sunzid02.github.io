import { useState } from "react";
import type { CreatorVideo } from "../../../../model/siteModel";
import { toYouTubeEmbedUrl } from "../../../utils/youtube";
import "./creator-carousel.css";

type Props = {
  items: CreatorVideo[];
};

export default function CreatorSliderView({ items }: Props) {
  const [index, setIndex] = useState(0);
  const [loadedIds, setLoadedIds] = useState<Record<string, boolean>>({});
  const [isAnimating, setIsAnimating] = useState(false);

  const total = items.length;

  if (!items || items.length === 0) {
    return <p className="hint">No videos yet.</p>;
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

  const markLoaded = (id: string) => {
    setLoadedIds((prev) => ({ ...prev, [id]: true }));
  };

  // Get visible cards
  const getVisibleCards = () => {
    const cards = [];
    
    // Show prev card if exists
    if (index > 0) {
      cards.push({ video: items[index - 1], idx: index - 1, position: 'prev' });
    }
    
    // Current card (always show)
    cards.push({ video: items[index], idx: index, position: 'current' });
    
    // Show next card if exists
    if (index < total - 1) {
      cards.push({ video: items[index + 1], idx: index + 1, position: 'next' });
    }
    
    return cards;
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="creator-carousel">
      {/* Left Arrow */}
      <button
        className="carousel-arrow carousel-arrow-left"
        onClick={goPrev}
        disabled={!canPrev || isAnimating}
        aria-label="Previous video"
      >
        ←
      </button>

      {/* Cards Track */}
      <div className="carousel-track">
        {visibleCards.map(({ video, idx, position }) => {
          const isLoaded = loadedIds[video.id];
          const isActive = position === 'current';

          return (
            <div
              key={video.id}
              className={`video-card ${isActive ? 'active' : 'side'}`}
              onClick={() => !isActive && !isAnimating && goTo(idx)}
            >
              {/* Video Container */}
              <div className="card-video-wrapper">
                {!isLoaded || !isActive ? (
                  <button
                    className="card-cover"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isActive && !isAnimating) markLoaded(video.id);
                    }}
                    aria-label={`Load video: ${video.title}`}
                  >
                    <span className="card-play">▶</span>
                    <span className="card-cover-text">
                      {isActive ? 'Load video' : 'Click to view'}
                    </span>
                  </button>
                ) : (
                  <iframe
                    className="card-iframe"
                    src={toYouTubeEmbedUrl(video.url, video.id)}
                    title={video.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>

              {/* Card Info */}
              <div className="card-info">
                <h3 className="card-title">{video.title}</h3>
                <p className="card-desc">{video.desc}</p>
                {isActive && (
                  
                   <a className="card-link"
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Open on YouTube
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        className="carousel-arrow carousel-arrow-right"
        onClick={goNext}
        disabled={!canNext || isAnimating}
        aria-label="Next video"
      >
        →
      </button>

      {/* Counter */}
      <div className="carousel-counter">
        Video {index + 1} of {total}
      </div>

      {/* Dots Navigation */}
      <div className="carousel-dots">
        {items.map((video, i) => (
          <button
            key={video.id}
            className={`carousel-dot ${i === index ? 'active' : ''}`}
            onClick={() => goTo(i)}
            disabled={isAnimating}
            aria-label={`Go to video ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}