import { useEffect, useState } from "react";

export default function BackToTopView() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
        <button
        className="back-to-top-btn"
        onClick={scrollToTop}
        aria-label="Back to top"
        >
        ↑
        </button>

  );
}
