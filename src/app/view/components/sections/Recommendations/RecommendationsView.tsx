import type { RecommendationsModel } from "../../../../model/siteModel";
import SectionTitleView from "../../ui/SectionTitle/SectionTitleView";

import "./recommendations.css";
import RecommendationsSliderView from "./RecommendationsSliderView";

type Props = {
  recommendations: RecommendationsModel;
};

export default function RecommendationsView({ recommendations }: Props) {
  return (
    <section id="recommendations" className="section fade-in">
      <SectionTitleView 
        title={recommendations.title} 
        subtitle={recommendations.intro} 
      />

      <div className="recommendations-linkedin-link">
        <a 
          href="https://www.linkedin.com/in/sarker-sunzid-mahmud/details/recommendations/"
          target="_blank"
          rel="noreferrer"
          className="linkedin-badge"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
          View All on LinkedIn
        </a>
      </div>

      <RecommendationsSliderView items={recommendations.items} />
    </section>
  );
}