import type { NavItem } from "../../../../model/siteModel";

type Props = {
  brandName: string;
  brandHref: string;
  nav: NavItem[];
};

export default function TopBarView({ brandName, brandHref, nav }: Props) {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <a className="brand" href={brandHref}>
          <span className="brand-badge" aria-hidden="true"></span>
          {brandName}
        </a>

        <nav className="nav" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.id} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
