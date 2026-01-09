import type { CreatorModel } from "../../../../model/siteModel";
import SectionTitleView from "../../ui/SectionTitle/SectionTitleView";
import CreatorSliderView from "./CreatorSliderView";

type Props = {
  creator: CreatorModel;
};

export default function CreatorView({ creator }: Props) {
  return (
    <section id="creator" className="section fade-in">
      <SectionTitleView title={creator.title} subtitle={creator.intro} />
      <p className="hint">{creator.hint}</p>

      <CreatorSliderView items={creator.videos} />
    </section>
  );
}