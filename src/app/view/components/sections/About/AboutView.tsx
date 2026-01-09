import type { AboutModel } from "../../../../model/siteModel";
import SectionTitleView from "../../ui/SectionTitle/SectionTitleView";

type Props = {
  about: AboutModel;
};

export default function AboutView({ about }: Props) {
  return (
    <section id="about" className="section fade-in">
      <SectionTitleView title={about.title} />

      {about.paragraphs.map((p, idx) => (
        <p key={idx}>{p}</p>
      ))}

      <p style={{ marginTop: "1rem" }}>
        Want a more personal view?{" "}
        <a
          href="https://www.youtube.com/watch?v=xNwMbXn1rpE"
          target="_blank"
          rel="noopener noreferrer"
          className="story-link"
        >
          Watch my story on YouTube →
        </a>
      </p>
    </section>
  );
}