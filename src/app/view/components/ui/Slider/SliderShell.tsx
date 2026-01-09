import type { ReactNode } from "react";

type Props = {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  dots?: ReactNode;
};

export default function SliderShell({ title, right, children, dots }: Props) {
  return (
    <div className="ui-slider">
      <div className="ui-slider-head">
        {title ? <div className="ui-slider-title">{title}</div> : <div />}
        <div className="ui-slider-right">{right}</div>
      </div>

      <div className="ui-slider-body">{children}</div>

      {dots && <div className="ui-slider-dots">{dots}</div>}
    </div>
  );
}
