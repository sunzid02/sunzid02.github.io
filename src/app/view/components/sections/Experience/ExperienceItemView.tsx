import { useId } from "react";

type Props = {
  title: string;
  when: string;
  bullets: string[];
  isOpen: boolean;
  onToggle: () => void;
};

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.8 9.2a1 1 0 011.4 0L12 13l3.8-3.8a1 1 0 011.4 1.4l-4.5 4.5a1 1 0 01-1.4 0L6.8 10.6a1 1 0 010-1.4z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function ExperienceItemView({
  title,
  when,
  bullets,
  isOpen,
  onToggle,
}: Props) {
  const panelId = useId();

  return (
    <article className={`exp-item ${isOpen ? "is-open" : ""}`}>
      <button
        type="button"
        className="exp-btn"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <div className="exp-main">
          <div className="exp-title">
            <span className="exp-role">{title}</span>
          </div>

          <div className="exp-meta">
            <span>{when}</span>
          </div>
        </div>

        <div className="exp-actions">
          <span className="exp-pill">{isOpen ? "Hide" : "Details"}</span>
          <span className="exp-chevron">
            <Chevron />
          </span>
        </div>
      </button>

      <div id={panelId} className="exp-panel" role="region" aria-label={title}>
        <div className="exp-panel-inner">
          <ul className="exp-bullets">
            {bullets.map((b, idx) => (
              <li key={`${title}-${idx}`}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
