import type { Meeting, Summary, SummarySection, TemplateId } from "./types";

// Heuristic, on-device summary generation used when a meeting has no authored
// summary for the chosen template. It is deliberately simple keyword extraction
// over the transcript — not an LLM — so template switching feels live without
// pretending to be model output. The walkthrough calls this out.

function firstSentence(text: string): string {
  const m = text.match(/^(.*?[.!?])(\s|$)/);
  return (m ? m[1] : text).trim();
}

function pick(meeting: Meeting, keywords: string[], limit: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of meeting.transcript) {
    const low = c.text.toLowerCase();
    if (keywords.some((k) => low.includes(k))) {
      const s = firstSentence(c.text);
      const key = s.toLowerCase();
      if (!seen.has(key) && s.length > 12) {
        seen.add(key);
        out.push(`${c.speaker}: ${s}`);
        if (out.length >= limit) break;
      }
    }
  }
  return out;
}

const SPEC: Record<TemplateId, { heading: string; keywords: string[] }[]> = {
  general: [
    { heading: "Key points", keywords: ["we'll", "let's", "agree", "going with", "decision", "plan", "focus"] },
    { heading: "Risks & concerns", keywords: ["risk", "concern", "depends", "blocked", "can't", "cannot", "slip", "worry"] },
  ],
  sales: [
    { heading: "Pain", keywords: ["losing", "hours", "headache", "manual", "problem", "badly"] },
    { heading: "Authority & process", keywords: ["own", "budget", "procurement", "security", "decision"] },
    { heading: "Objections", keywords: ["worry", "adoption", "review", "concern", "risk"] },
  ],
  standup: [
    { heading: "In flight", keywords: ["working", "hardening", "finishing", "migrating", "running", "spike"] },
    { heading: "Blocked", keywords: ["blocked", "waiting", "depends", "can't", "cannot"] },
  ],
  one_on_one: [
    { heading: "Wins", keywords: ["shipped", "better", "great", "proud", "win", "energized"] },
    { heading: "Challenges", keywords: ["stretched", "hard", "context", "struggling", "thin"] },
    { heading: "Growth", keywords: ["grow", "role", "career", "tech-lead", "milestone", "longer term"] },
  ],
  interview: [
    { heading: "Strengths", keywords: ["experience", "led", "built", "shipped", "strong"] },
    { heading: "Concerns", keywords: ["concern", "unsure", "gap", "worry", "risk"] },
  ],
  customer_success: [
    { heading: "Health", keywords: ["usage", "up", "adoption", "nps", "love"] },
    { heading: "Risks", keywords: ["bug", "risk", "logout", "concern", "dealbreaker"] },
    { heading: "Expansion", keywords: ["expansion", "add", "seats", "teams", "renewal"] },
  ],
};

export function getSummary(meeting: Meeting, templateId: TemplateId): { summary: Summary; generated: boolean } {
  const authored = meeting.summaries.find((s) => s.templateId === templateId);
  if (authored) return { summary: authored, generated: false };

  const sections: SummarySection[] = SPEC[templateId].map(({ heading, keywords }) => ({
    heading,
    bullets: pick(meeting, keywords, 4),
  }));

  // Always append next steps / follow-ups from action items.
  const steps = meeting.actionItems.map(
    (a) => `${a.text}${a.assignee ? ` — ${a.assignee}` : ""}`,
  );
  const stepHeading = templateId === "customer_success" ? "Follow-ups" : "Next steps";
  sections.push({ heading: stepHeading, bullets: steps });

  return {
    summary: { templateId, sections: sections.filter((s) => s.bullets.length > 0) },
    generated: true,
  };
}
