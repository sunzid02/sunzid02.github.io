import { useState } from "react";
import type { HeroModel } from "../../../../model/siteModel";
import heroPhoto from "../../../../../../public/assets/travel/germany.jpg";
import Icon from "../../ui/Icon/Icon";

type Props = { hero: HeroModel };

export default function HeroView({ hero }: Props) {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(hero.cta.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="hero fade-in">
      <div className="hero-grid">
        <div className="hero-media" aria-hidden="true">
          <img className="hero-photo" src={heroPhoto} alt="" />
          <div className="hero-caption">Borussia-Park, Mönchengladbach, Germany 🇩🇪</div>
        </div>

        <div className="hero-content">
          <div className="hero-kicker">Building reliable systems with calm execution</div>

          <h1>{hero.headline}</h1>
          <p className="sub">{hero.subline}</p>

          <div className="pill-row" role="list" aria-label="Highlights">
            {hero.pills.map((text, idx) => (
              <div key={`${text}-${idx}`} className="pill" role="listitem">
                {text}
              </div>
            ))}
          </div>

          <div className="hero-cta">
            {/* Email with Copy Button */}
            <div className="hero-email-group">
              <a 
                className="hero-email-btn" 
                href={`mailto:${hero.cta.email}`}
                aria-label="Send Email"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span className="hero-email-text">{hero.cta.email}</span>
              </a>
              <button 
                className="hero-copy-btn" 
                onClick={copyEmail}
                aria-label="Copy email"
                title={copied ? "Copied!" : "Copy email"}
              >
                {copied ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Social Links */}
            <div className="hero-links">
              {hero.cta.links.map((l) => (
                
               <a   key={l.url}
                  className={`hero-icon-btn is-${l.icon}`}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={l.label}
                  title={l.label}
                >
                  <Icon name={l.icon as any} />
                </a>
              ))}
            </div>

            {/* Resume Button */}
            <a
              className="hero-resume-btn"
              href="https://drive.google.com/drive/folders/1PXEJ4_NRQ9nW5tHitP-l6cMX2-Fhw_0v?usp=sharing"
              target="_blank"
              rel="noreferrer"
              aria-label="View Resume"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              View Resume
            </a>
          </div>

          <p className="note">{hero.note}</p>
        </div>
      </div>
    </section>
  );
}