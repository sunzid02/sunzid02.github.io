import type { TechModel } from "../../../../model/siteModel";
import SectionTitleView from "../../ui/SectionTitle/SectionTitleView";
import TechCubeView from "./TechCubeView";

type Props = {
  tech: TechModel;
};

export default function TechView({ tech }: Props) {
  return (
    <section id="stack" className="section fade-in">
      <SectionTitleView title={tech.title} subtitle={tech.hint} />
      <TechCubeView tech={tech} />
    </section>
  );
}