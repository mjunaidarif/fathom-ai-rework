import type { SummaryTemplate } from "./types";

export const TEMPLATES: SummaryTemplate[] = [
  {
    id: "general",
    name: "General",
    description: "Balanced recap of any meeting — context, discussion, decisions, next steps.",
  },
  {
    id: "sales",
    name: "Sales Discovery",
    description: "Pain points, budget, authority, timeline, and objections for a sales call.",
  },
  {
    id: "standup",
    name: "Team Standup",
    description: "What each person did, is doing, and what's blocking them.",
  },
  {
    id: "one_on_one",
    name: "1:1",
    description: "Wins, challenges, feedback, and growth topics from a manager 1:1.",
  },
  {
    id: "interview",
    name: "Interview",
    description: "Candidate signal by competency, with a hire/no-hire lean.",
  },
  {
    id: "customer_success",
    name: "Customer Success",
    description: "Health, risks, expansion signals, and follow-ups for an account call.",
  },
];

export const TEMPLATE_BY_ID = Object.fromEntries(
  TEMPLATES.map((t) => [t.id, t]),
) as Record<string, SummaryTemplate>;
