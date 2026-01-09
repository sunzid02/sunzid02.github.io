import type { ReactNode } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;

  className?: string;
  headerRight?: ReactNode;
};

export default function CardView({
  title,
  subtitle,
  badge,
  children,
  className,
  headerRight,
}: Props) {
  return (
    <article className={`card ${className ?? ""}`.trim()}>
      {(title || subtitle || badge || headerRight) && (
        <header className="card-head">
          <div className="card-head-left">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>

          <div className="card-head-right">
            {badge && <span className="badge">{badge}</span>}
            {headerRight}
          </div>
        </header>
      )}

      <div className="card-body">{children}</div>
    </article>
  );
}
