import { useState } from "react";
import type { ExperienceModel } from "../../../../model/siteModel";
import SectionTitleView from "../../ui/SectionTitle/SectionTitleView";
import ExperienceItemView from "./ExperienceItemView";
import "./experience.css";

type Props = {
  experience: ExperienceModel;
};

export default function ExperienceView({ experience }: Props) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="experience" className="section fade-in">
      <SectionTitleView title={experience.title} />

      <div className="exp">
        <div className="exp-list">
          {experience.items.map((item, idx) => (
            <ExperienceItemView
              key={`${item.title}-${item.when}`}
              title={item.title}
              when={item.when}
              bullets={item.bullets}
              isOpen={openIndex === idx}
              onToggle={() => setOpenIndex((cur) => (cur === idx ? -1 : idx))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
