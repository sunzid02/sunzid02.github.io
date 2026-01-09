type Props = {
  title: string;
  subtitle?: string;
};

export default function SectionTitleView({ title, subtitle }: Props) {
  return (
    <header className="section-header">
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </header>
  );
}
