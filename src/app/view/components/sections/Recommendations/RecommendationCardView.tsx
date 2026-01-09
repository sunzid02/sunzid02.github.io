import type { RecommendationItem } from "../../../../model/siteModel";

type Props = {
  recommendation: RecommendationItem;
};

export default function RecommendationCardView({ recommendation }: Props) {
  return (
    <div className="recommendation-card">
      {/* Header with photo and info */}
      <div className="recommendation-header">
        {recommendation.photo ? (
          <div className="recommendation-photo">
            <img src={recommendation.photo} alt={recommendation.name} />
          </div>
        ) : (
          <div className="recommendation-photo recommendation-photo-placeholder">
            <span>{recommendation.name.charAt(0)}</span>
          </div>
        )}
        
        <div className="recommendation-info">
          <h3 className="recommendation-name">{recommendation.name}</h3>
          <p className="recommendation-role">{recommendation.role}</p>
          <p className="recommendation-company">{recommendation.company}</p>
        </div>
      </div>

      {/* Quote icon */}
      <div className="recommendation-quote-icon">"</div>

      {/* Recommendation text */}
      <div className="recommendation-text">
        <p>{recommendation.text}</p>
      </div>

      {/* LinkedIn link if available */}
      {recommendation.linkedin && (
        <a 
          href={recommendation.linkedin}
          target="_blank"
          rel="noreferrer"
          className="recommendation-linkedin"
        >
          View on LinkedIn →
        </a>
      )}
    </div>
  );
}