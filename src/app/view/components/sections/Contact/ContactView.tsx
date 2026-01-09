import type { ContactModel } from "../../../../model/siteModel";
import SectionTitleView from "../../ui/SectionTitle/SectionTitleView";

type Props = {
  contact: ContactModel;
};

export default function ContactView({ contact }: Props) {
  return (
    <section id="contact" className="section fade-in">
      <SectionTitleView title="Contact" />

      <p>
        <a href={`mailto:${contact.email}`}>{contact.email}</a>
      </p>

      <div className="links">
        {contact.links.map((l) => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer">
            {l.label}
          </a>
        ))}
      </div>
    </section>
  );
}
