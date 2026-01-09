import { useEffect } from "react";

export function useActiveSection() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id]"));
    const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav a"));

    if (!("IntersectionObserver" in window) || sections.length === 0) return;

    const setActive = (id: string) => {
      navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === `#${id}`) link.classList.add("is-active");
        else link.classList.remove("is-active");
      });
    };

    // store latest visibility ratio for every section
    const ratios = new Map<string, number>();
    sections.forEach((s) => ratios.set(s.id, 0));

    const pickBest = () => {
      let bestId = sections[0].id;
      let bestRatio = -1;

      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          bestId = id;
        }
      });

      // if everything is 0, fallback to first section
      if (bestId) setActive(bestId);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        });

        pickBest();
      },
      {
        threshold: [0, 0.12, 0.2, 0.35, 0.5, 0.7],
        rootMargin: "-35% 0px -50% 0px",
      }
    );

    sections.forEach((s) => observer.observe(s));

    // Bottom fallback to ensure contact highlights at page end
    const onScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 8;
      if (nearBottom) setActive("contact");
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);
}
