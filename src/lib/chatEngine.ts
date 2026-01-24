import { siteModel } from "../app/model/siteModel.js";

type QuickAction = { label: string; message: string };

export type ChatReply = {
  answer: string;
  quickActions?: QuickAction[];
};

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreMatch = (query: string, text: string) => {
  const q = normalize(query);
  const t = normalize(text);
  if (!q || !t) return 0;

  const words = q.split(" ").filter((w) => w.length >= 3);
  let score = 0;

  for (const w of words) {
    if (t.includes(w)) score += 1;
  }
  return score;
};

const join = (arr: string[], sep = " ") => arr.filter(Boolean).join(sep);

function buildSearchCorpus() {
  const hero = siteModel.hero;
  const about = siteModel.about;
  const exp = siteModel.experience?.items ?? [];
  const projects = siteModel.projects?.items ?? [];
  const techFaces = siteModel.tech?.faces ?? [];
  const contact = siteModel.contact;

  const techText = techFaces
    .map((f) => `${f.title} ${f.badge} ${join(f.items, " ")}`)
    .join("\n");

  const expText = exp
    .map((e) => `${e.title} ${e.when} ${join(e.bullets, " ")}`)
    .join("\n");

  const projectText = projects
    .map((p) => `${p.title} ${p.desc} ${p.meta} ${p.url ?? ""}`)
    .join("\n");

  const contactText = [
    `email: ${hero.cta.email}`,
    (hero.cta.links ?? []).map((l) => `${l.label}: ${l.url}`).join(" "),
    (contact?.links ?? []).map((l) => `${l.label}: ${l.url}`).join(" "),
  ].join("\n");

  const aboutText = `${about.title}\n${join(about.paragraphs, "\n")}\nFocus: ${join(
    about.focusAreas,
    ", "
  )}`;

  const heroText = `${hero.headline}\n${hero.subline}\n${join(hero.pills, " | ")}\n${hero.note}`;

  return {
    hero,
    about,
    exp,
    projects,
    techFaces,
    contact,
    corpus: [heroText, aboutText, techText, expText, projectText, contactText].join("\n\n"),
  };
}

const quickDefaults: QuickAction[] = [
  { label: "Summary", message: "Summarise your profile" },
  { label: "Skills", message: "What are your skills?" },
  { label: "Experience", message: "Show your experience" },
  { label: "Projects", message: "Show your projects" },
  { label: "GitHub", message: "Share your GitHub" },
];

export function answerFromSiteModel(userMessage: string): ChatReply {
  const { hero, about, exp, projects, techFaces, corpus } = buildSearchCorpus();
  const msg = normalize(userMessage);

  // Simple intents
  if (
    msg.includes("summary") ||
    msg.includes("summarise") ||
    msg.includes("introduce") ||
    msg.includes("profile") ||
    msg.includes("about you")
  ) {
    return {
      answer: `${hero.headline}\n${hero.subline}\n\n${about.paragraphs?.[0] ?? ""}`.trim(),
      quickActions: [
        { label: "More details", message: "Give me a longer summary" },
        { label: "Skills", message: "What are your skills?" },
        { label: "Projects", message: "Show your top projects" },
      ],
    };
  }

  if (msg.includes("longer summary") || msg.includes("detailed")) {
    const text = join(about.paragraphs, "\n\n").trim();
    return { answer: text || `${hero.headline}\n${hero.subline}` };
  }

  if (
    msg.includes("skill") ||
    msg.includes("stack") ||
    msg.includes("tech") ||
    msg.includes("tools")
  ) {
    const pills = hero.pills?.length ? `Core: ${hero.pills.join(" | ")}` : "";
    const faces = techFaces
      .map((f) => `${f.title}: ${f.items.slice(0, 8).join(", ")}`)
      .slice(0, 6)
      .join("\n");
    return {
      answer: [pills, faces].filter(Boolean).join("\n\n").trim() || "Tech stack info is not set yet.",
    };
  }

  if (msg.includes("experience") || msg.includes("job") || msg.includes("work")) {
    const top = exp.slice(0, 4);
    if (!top.length) return { answer: "Experience section is not set yet." };

    const text = top
      .map((e) => `• ${e.title} (${e.when})\n  - ${e.bullets.join("\n  - ")}`)
      .join("\n\n");

    return { answer: text };
  }

  if (msg.includes("project") || msg.includes("portfolio")) {
    const top = projects.slice(0, 6);
    if (!top.length) return { answer: "Projects section is not set yet." };

    const text = top
      .map((p) => `• ${p.title}\n  ${p.desc}\n  ${p.url ? p.url : ""}`.trim())
      .join("\n\n");

    return { answer: text };
  }

  if (msg.includes("github")) {
    const gh = hero.cta.links?.find((l) => l.label.toLowerCase() === "github");
    return { answer: gh ? `GitHub: ${gh.url}` : "GitHub link is not set yet." };
  }

  if (msg.includes("linkedin")) {
    const li = hero.cta.links?.find((l) => l.label.toLowerCase() === "linkedin");
    return { answer: li ? `LinkedIn: ${li.url}` : "LinkedIn link is not set yet." };
  }

  if (msg.includes("email") || msg.includes("contact")) {
    return { answer: `Email: ${hero.cta.email}` };
  }

  // Fallback: lightweight search over the full corpus
  const score = scoreMatch(userMessage, corpus);
  if (score >= 3) {
    return {
      answer:
        "I found related info in my portfolio. Try asking more specifically, like:\n" +
        "- “Summarise your profile”\n" +
        "- “Show your experience”\n" +
        "- “Show your projects”\n" +
        "- “What is your stack?”",
      quickActions: quickDefaults,
    };
  }

  return {
    answer:
      "Ask me about my summary, skills, experience, projects, or contact info. Try one of the buttons below.",
    quickActions: quickDefaults,
  };
}
