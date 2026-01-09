import type { TravelModel } from "../../../../model/siteModel";
import SectionTitleView from "../../ui/SectionTitle/SectionTitleView";
import TravelSliderView from "./TravelSliderView";
import "./travel-book.css";

type Props = {
  travel: TravelModel;
};

export default function TravelView({ travel }: Props) {
  return (
    <section id="travel" className="section fade-in">
      <SectionTitleView title={travel.title} subtitle={travel.intro} />

      {/* Countries Visited */}
      <div className="flags" aria-label="Countries visited">
        {travel.flags && travel.flags.length > 0 ? (
          travel.flags.map((f) => (
            <span key={f.name} className="flag" title={f.name}>
              <span className="flag-emoji">{f.emoji}</span>
              <span className="flag-name">{f.name}</span>
            </span>
          ))
        ) : (
          <>
            <span className="flag" title="Germany">
              <span className="flag-emoji">🇩🇪</span>
              <span className="flag-name">Germany</span>
            </span>
            <span className="flag" title="Austria">
              <span className="flag-emoji">🇦🇹</span>
              <span className="flag-name">Austria</span>
            </span>
            <span className="flag" title="Switzerland">
              <span className="flag-emoji">🇨🇭</span>
              <span className="flag-name">Switzerland</span>
            </span>
            <span className="flag" title="Croatia">
              <span className="flag-emoji">🇭🇷</span>
              <span className="flag-name">Croatia</span>
            </span>
            <span className="flag" title="Spain">
              <span className="flag-emoji">🇪🇸</span>
              <span className="flag-name">Spain</span>
            </span>
            <span className="flag" title="Turkey">
              <span className="flag-emoji">🇹🇷</span>
              <span className="flag-name">Turkey</span>
            </span>
            <span className="flag" title="France">
              <span className="flag-emoji">🇫🇷</span>
              <span className="flag-name">France</span>
            </span>
            <span className="flag" title="Bangladesh">
              <span className="flag-emoji">🇧🇩</span>
              <span className="flag-name">Bangladesh</span>
            </span>
          </>
        )}
      </div>


       {/* photo album  */}
      <p className="hint">{travel.photos.hint}</p>
      <TravelSliderView items={travel.photos.items} />


      {/* Inspirational Travel Quote */}
      <figure className="quote">
        <blockquote>
          Travel is the only thing you buy that makes you richer. Every journey opens your mind, 
          expands your perspective, and fills your soul with memories that no money can ever buy.
        </blockquote>
        <figcaption>Anonymous Traveler</figcaption>
      </figure>

      {/* Original quote if exists */}
      {/* {travel.quote && (
        <figure className="quote quote-secondary">
          <blockquote>{travel.quote.text}</blockquote>
          <figcaption>{travel.quote.author}</figcaption>
        </figure>
      )} */}

      {/* <SectionTitleView title={travel.photos.title} subtitle={travel.photos.intro} /> */}

    </section>
  );
}