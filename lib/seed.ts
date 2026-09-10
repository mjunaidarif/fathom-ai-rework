import type { CalendarEvent, Meeting, User } from "./types";

// --- Palette for generated avatar chips / speaker colors -------------------
const C = {
  indigo: "#6366f1",
  violet: "#8b5cf6",
  sky: "#0ea5e9",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  teal: "#14b8a6",
  fuchsia: "#d946ef",
  slate: "#64748b",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export const CURRENT_USER_ID = "u_maya";

export const USERS: User[] = [
  { id: "u_maya", name: "Maya Chen", email: "maya@northwind.io", avatarColor: C.indigo, initials: "MC" },
  { id: "u_dev", name: "Devon Park", email: "devon@northwind.io", avatarColor: C.emerald, initials: "DP" },
  { id: "u_sam", name: "Sam Rivera", email: "sam@northwind.io", avatarColor: C.amber, initials: "SR" },
  { id: "u_priya", name: "Priya Nair", email: "priya@northwind.io", avatarColor: C.rose, initials: "PN" },
];

const min = (m: number) => m * 60_000;

// Small helper to build transcript cues tersely: [speaker, startSec, text]
function cues(rows: [string, number, string][], gapDefault = 8) {
  return rows.map(([speaker, startSec, text], i) => {
    const nextStart = rows[i + 1]?.[1];
    const endSec = nextStart != null ? nextStart : startSec + gapDefault;
    return {
      id: `c${i + 1}`,
      speaker,
      startMs: Math.round(startSec * 1000),
      endMs: Math.round(endSec * 1000),
      text,
    };
  });
}

// =========================================================================
// FLAGSHIP: 8-person, ~58 min roadmap call — the case the brief cares about.
// =========================================================================
const roadmap: Meeting = {
  id: "m_roadmap_q3",
  title: "Q3 Roadmap Planning — Product & Engineering",
  platform: "zoom",
  startedAt: "2026-09-08T16:00:00.000Z",
  durationS: 58 * 60 + 12,
  ownerId: "u_maya",
  isTeamShared: true,
  tags: ["Planning", "Product", "Engineering"],
  thumbnailHue: 245,
  recap:
    "The team locked Q3 themes around activation and reliability, agreed to cut the reporting revamp to a fast-follow, and assigned owners for the three headline bets.",
  attendees: [
    { name: "Maya Chen", email: "maya@northwind.io", isHost: true, speakerLabel: "Maya", talkTimeS: 940, color: C.indigo },
    { name: "Devon Park", email: "devon@northwind.io", isHost: false, speakerLabel: "Devon", talkTimeS: 610, color: C.emerald },
    { name: "Sam Rivera", email: "sam@northwind.io", isHost: false, speakerLabel: "Sam", talkTimeS: 505, color: C.amber },
    { name: "Priya Nair", email: "priya@northwind.io", isHost: false, speakerLabel: "Priya", talkTimeS: 430, color: C.rose },
    { name: "Tomás Alvarez", email: "tomas@northwind.io", isHost: false, speakerLabel: "Tomás", talkTimeS: 320, color: C.sky },
    { name: "Grace Liu", email: "grace@northwind.io", isHost: false, speakerLabel: "Grace", talkTimeS: 280, color: C.teal },
    { name: "Ben Okafor", email: "ben@northwind.io", isHost: false, speakerLabel: "Ben", talkTimeS: 240, color: C.fuchsia },
    { name: "Hannah Weiss", email: "hannah@northwind.io", isHost: false, speakerLabel: "Hannah", talkTimeS: 160, color: C.violet },
  ],
  summaries: [
    {
      templateId: "general",
      sections: [
        {
          heading: "Context",
          bullets: [
            "Quarterly planning to pick three headline bets for Q3 and name owners.",
            "Activation stayed flat last quarter despite the onboarding refresh; reliability incidents doubled month over month.",
          ],
        },
        {
          heading: "Decisions",
          bullets: [
            "Q3 themes are Activation and Reliability; the reporting revamp is cut to a Q4 fast-follow.",
            "Guided setup checklist is the headline activation bet, owned by Priya.",
            "Reliability workstream gets a dedicated on-call rotation and an error-budget policy, owned by Devon.",
            "Sam owns the new usage-based pricing experiment behind a flag.",
          ],
        },
        {
          heading: "Risks & open questions",
          bullets: [
            "Guided setup depends on the events pipeline Tomás is still hardening — flagged as the critical path.",
            "Grace raised that support headcount can't absorb a pricing change and a reliability push at once.",
          ],
        },
        {
          heading: "Next steps",
          bullets: [
            "Priya to spec the setup checklist and share a Figma flow by Fri.",
            "Devon to draft the error-budget policy and circulate before next planning.",
            "Sam to define pricing experiment success metrics with Maya.",
          ],
        },
      ],
    },
    {
      templateId: "standup",
      sections: [
        {
          heading: "In flight",
          bullets: [
            "Tomás: hardening the events pipeline; backfill running, ~2 days out.",
            "Ben: finishing the mobile session-replay spike.",
            "Hannah: migrating the design system tokens to v2.",
          ],
        },
        {
          heading: "Blocked",
          bullets: [
            "Priya blocked on setup checklist until the events pipeline lands.",
            "Grace waiting on final pricing copy before updating help docs.",
          ],
        },
      ],
    },
  ],
  actionItems: [
    { id: "a1", text: "Spec the guided setup checklist and share a Figma flow", assignee: "Priya Nair", done: false, atMs: min(22) },
    { id: "a2", text: "Draft the error-budget policy and on-call rotation", assignee: "Devon Park", done: false, atMs: min(31) },
    { id: "a3", text: "Define success metrics for the pricing experiment", assignee: "Sam Rivera", done: false, atMs: min(41) },
    { id: "a4", text: "Confirm events-pipeline backfill completion date", assignee: "Tomás Alvarez", done: true, atMs: min(14) },
    { id: "a5", text: "Check support capacity against combined Q3 scope", assignee: "Grace Liu", done: false, atMs: min(48) },
  ],
  highlights: [
    {
      id: "h1",
      startMs: min(21),
      endMs: min(23),
      label: "Decision: guided setup is the activation bet",
      note: "Clear moment the room aligned on the headline bet.",
      createdBy: "Maya Chen",
      createdAt: "2026-09-08T16:23:40.000Z",
      cueIds: ["c11", "c12", "c13"],
    },
    {
      id: "h2",
      startMs: min(30),
      endMs: min(32),
      label: "Reliability: error-budget policy",
      createdBy: "Devon Park",
      createdAt: "2026-09-08T16:32:10.000Z",
      cueIds: ["c17", "c18"],
    },
    {
      id: "h3",
      startMs: min(47),
      endMs: min(49),
      label: "Risk: support can't absorb both pushes",
      note: "Worth raising with leadership before we commit.",
      createdBy: "Maya Chen",
      createdAt: "2026-09-08T16:49:05.000Z",
      cueIds: ["c27", "c28"],
    },
  ],
  comments: [
    { id: "cm1", atMs: min(22), author: "Sam Rivera", body: "Love this — activation is the right #1.", createdAt: "2026-09-08T18:02:00.000Z" },
    { id: "cm2", atMs: min(48), author: "Devon Park", body: "Agree with Grace. Let's stagger these.", createdAt: "2026-09-08T18:10:00.000Z" },
  ],
  transcript: cues([
    ["Maya", 0, "Alright, we're all here — thanks everyone. Goal today is to walk out with three Q3 bets and an owner on each. No solo heroics, real owners."],
    ["Maya", 40, "Quick reality check first. Activation was basically flat last quarter even after the onboarding refresh, and reliability incidents doubled month over month. Those two numbers frame everything."],
    ["Devon", 95, "On reliability — the doubling is mostly the events pipeline choking under the new load. It's not random, it's one hotspot."],
    ["Tomás", 140, "Right, and I'm halfway through hardening it. Backfill is running now, I'd say two days out before it's stable."],
    ["Maya", 180, "Good. Tomás can you confirm the backfill completion date by end of day? I want it as a tracked item."],
    ["Tomás", 210, "Yep, I'll confirm today."],
    ["Sam", 250, "Can I zoom out? If activation is flat, the checklist and the pricing story are the two levers. I don't think we can do both at full tilt."],
    ["Priya", 300, "The onboarding data says people drop off before they hit the first 'aha'. A guided setup checklist would attack exactly that."],
    ["Grace", 360, "From support's side, most first-week tickets are 'how do I even start' — so yes, a checklist would cut that volume too."],
    ["Ben", 420, "I did a session-replay spike on new signups. It's brutal — people bounce between five screens looking for where to begin."],
    ["Maya", 480, "Okay. I'm hearing guided setup as the headline activation bet. Any objection?"],
    ["Sam", 520, "No objection, just want it flagged that it depends on the events pipeline being solid."],
    ["Priya", 560, "Agreed, and I'll own it. I can spec the checklist and share a Figma flow by Friday."],
    ["Maya", 600, "Perfect, that's bet one, Priya owns it. Let's do reliability next."],
    ["Devon", 660, "For reliability I want two things: a real on-call rotation and an error-budget policy so we stop shipping into a burning building."],
    ["Hannah", 720, "Does the error budget touch design system work? I'm mid-migration on tokens v2."],
    ["Devon", 780, "Only if your changes ship to prod during a freeze — otherwise you're fine. I'll write the policy so it's unambiguous."],
    ["Devon", 840, "I'll draft the error-budget policy and the rotation and circulate before next planning."],
    ["Maya", 900, "Great, that's bet two, Devon owns reliability. Third bet — Sam, the pricing experiment."],
    ["Sam", 960, "Usage-based pricing, behind a flag, small cohort. The hypothesis is that self-serve teams expand faster when they're not gated by seats."],
    ["Sam", 1020, "I'd keep it tightly scoped — one cohort, clear metrics, kill it fast if it doesn't move expansion."],
    ["Maya", 1080, "I like it if it's genuinely small. Sam, define success metrics with me this week so we don't move the goalposts later."],
    ["Sam", 1130, "Works. I'll get you a one-pager."],
    ["Priya", 1180, "One dependency call-out: my checklist can't really start until Tomás's pipeline lands, so that's the critical path."],
    ["Tomás", 1230, "Understood. I'll treat the pipeline as the gating item and keep you posted daily."],
    ["Grace", 1290, "Can I raise a resourcing risk? Support can't absorb a pricing change and a reliability push in the same window. Something will slip."],
    ["Maya", 1350, "That's a real risk. Let's note it — we may need to stagger the pricing rollout after reliability stabilizes."],
    ["Devon", 1410, "Agreed, stagger it. Reliability first, pricing a few weeks behind."],
    ["Grace", 1470, "I'll check exact support capacity against the combined scope and bring numbers."],
    ["Ben", 1540, "Where does mobile land in all this? The replay spike showed mobile activation is worse than web."],
    ["Maya", 1600, "Mobile's important but it's not a Q3 headline — let's fold the quick wins into the checklist work and revisit mobile as its own bet in Q4."],
    ["Hannah", 1670, "Tokens v2 will actually help mobile polish, so some of that comes for free."],
    ["Maya", 1740, "Love it. So: bet one guided setup, Priya. Bet two reliability, Devon. Bet three pricing experiment, Sam, staggered. Reporting revamp slips to a Q4 fast-follow."],
    ["Sam", 1810, "Clean. That's the most focused plan we've had in a while."],
    ["Maya", 1870, "Let's keep it that way. I'll send notes and the action items right after this. Thanks everyone."],
    ["Priya", 1930, "Thanks all!"],
    ["Devon", 1970, "Thanks — I'll get the policy draft out."],
  ]),
};

// =========================================================================
// Sales discovery call
// =========================================================================
const salesCall: Meeting = {
  id: "m_sales_brightwave",
  title: "Discovery — Brightwave (Series B, 120 seats)",
  platform: "meet",
  startedAt: "2026-09-07T14:30:00.000Z",
  durationS: 34 * 60 + 5,
  ownerId: "u_sam",
  isTeamShared: true,
  tags: ["Sales", "Discovery"],
  thumbnailHue: 28,
  recap:
    "Brightwave is drowning in manual call notes across a 40-rep sales org; strong pain and a champion, but procurement needs security review before a Q4 decision.",
  attendees: [
    { name: "Sam Rivera", email: "sam@northwind.io", isHost: true, speakerLabel: "Sam", talkTimeS: 560, color: C.amber },
    { name: "Alex Turner", email: "alex@brightwave.com", isHost: false, speakerLabel: "Alex", talkTimeS: 720, color: C.sky },
    { name: "Dana Foster", email: "dana@brightwave.com", isHost: false, speakerLabel: "Dana", talkTimeS: 410, color: C.rose },
  ],
  summaries: [
    {
      templateId: "sales",
      sections: [
        { heading: "Pain", bullets: [
          "40 reps manually writing call notes; ~5 hrs/rep/week lost.",
          "CRM hygiene is poor because notes never make it into Salesforce.",
        ] },
        { heading: "Authority", bullets: [
          "Alex (VP Sales) is the champion and economic buyer up to $50k.",
          "Above that, procurement + security review required.",
        ] },
        { heading: "Budget & timeline", bullets: [
          "Budget exists in the Q4 tooling line; wants a decision before end of quarter.",
        ] },
        { heading: "Objections", bullets: [
          "Security review is the gate — needs SOC 2 report and a DPA.",
          "Dana concerned about rep adoption after a past tool failed to stick.",
        ] },
      ],
    },
  ],
  actionItems: [
    { id: "a1", text: "Send SOC 2 Type II report and DPA to Dana", assignee: "Sam Rivera", done: false, atMs: min(24) },
    { id: "a2", text: "Share Salesforce auto-sync demo recording", assignee: "Sam Rivera", done: false, atMs: min(18) },
    { id: "a3", text: "Loop in Alex's SE for a security questionnaire", assignee: "Alex Turner", done: false, atMs: min(29) },
  ],
  highlights: [
    { id: "h1", startMs: min(6), endMs: min(8), label: "Quantified pain: 5 hrs/rep/week", createdBy: "Sam Rivera", createdAt: "2026-09-07T15:10:00.000Z", cueIds: ["c3", "c4"] },
    { id: "h2", startMs: min(23), endMs: min(25), label: "Security review is the gate", createdBy: "Sam Rivera", createdAt: "2026-09-07T15:12:00.000Z", cueIds: ["c9"] },
  ],
  comments: [],
  transcript: cues([
    ["Sam", 0, "Thanks for making time. I'd love to understand how your team handles call notes today before I show anything."],
    ["Alex", 30, "Honestly? Badly. We've got 40 reps and everyone does it differently, mostly scribbling during calls."],
    ["Alex", 90, "If I had to put a number on it, we're losing something like five hours per rep per week just on notes and CRM updates."],
    ["Sam", 150, "That's a lot of selling time. And does that make it into Salesforce reliably?"],
    ["Dana", 200, "It does not. That's my headache — pipeline reports are only as good as what reps remember to type in, which is not much."],
    ["Sam", 260, "So the notes exist in people's heads and notebooks, but the system of record is thin."],
    ["Alex", 320, "Exactly. And I can't coach what I can't see."],
    ["Sam", 380, "Got it. Who'd be involved in a decision if this looked like a fit?"],
    ["Alex", 430, "I own the tooling budget up to fifty thousand. Past that it's procurement, and security has to review anything that records calls."],
    ["Dana", 500, "And I'll be honest, we tried a tool last year that nobody adopted. Adoption is my worry more than price."],
    ["Sam", 560, "That's fair, and it's the right worry. The auto-sync to Salesforce is usually what makes it stick — reps don't change behavior, the notes just appear."],
    ["Alex", 640, "If that's real, that's compelling. Can you send a recording of that sync working?"],
    ["Sam", 700, "Absolutely. I'll also send our SOC 2 report and a DPA so security can start early — that's usually the long pole."],
    ["Dana", 760, "Yes please, send those to me directly and I'll route them."],
    ["Alex", 820, "Let's aim to have a view before end of quarter. Budget's in the Q4 line."],
    ["Sam", 880, "Perfect. I'll get those materials over today and we'll set up a technical follow-up."],
  ]),
};

// =========================================================================
// Customer success check-in
// =========================================================================
const csCall: Meeting = {
  id: "m_cs_acme",
  title: "Quarterly Check-in — Acme Co.",
  platform: "teams",
  startedAt: "2026-09-05T18:00:00.000Z",
  durationS: 27 * 60 + 40,
  ownerId: "u_priya",
  isTeamShared: true,
  tags: ["Customer Success", "QBR"],
  thumbnailHue: 340,
  recap:
    "Acme is healthy and expanding two teams next quarter, but flagged an unresolved SSO bug and wants a roadmap session on reporting.",
  attendees: [
    { name: "Priya Nair", email: "priya@northwind.io", isHost: true, speakerLabel: "Priya", talkTimeS: 480, color: C.rose },
    { name: "Jordan Kim", email: "jordan@acme.co", isHost: false, speakerLabel: "Jordan", talkTimeS: 520, color: C.emerald },
  ],
  summaries: [
    {
      templateId: "customer_success",
      sections: [
        { heading: "Health", bullets: ["Usage up 18% QoQ; two power teams driving adoption.", "NPS from last pulse: 9."] },
        { heading: "Expansion signals", bullets: ["Planning to add Support and Ops teams next quarter (~30 seats)."] },
        { heading: "Risks", bullets: ["Open SSO bug causing intermittent logouts — visible to their admins.", "Wants better reporting or will 'look around' at renewal."] },
        { heading: "Follow-ups", bullets: ["Escalate SSO bug with a timeline.", "Book a reporting roadmap session."] },
      ],
    },
  ],
  actionItems: [
    { id: "a1", text: "Escalate SSO logout bug and give Jordan a fix timeline", assignee: "Priya Nair", done: false, atMs: min(12) },
    { id: "a2", text: "Schedule reporting roadmap session with product", assignee: "Priya Nair", done: false, atMs: min(20) },
    { id: "a3", text: "Send expansion quote for ~30 seats", assignee: "Priya Nair", done: true, atMs: min(24) },
  ],
  highlights: [
    { id: "h1", startMs: min(11), endMs: min(13), label: "Risk: SSO bug hitting their admins", createdBy: "Priya Nair", createdAt: "2026-09-05T18:30:00.000Z", cueIds: ["c5", "c6"] },
    { id: "h2", startMs: min(19), endMs: min(21), label: "Expansion: +2 teams next quarter", createdBy: "Priya Nair", createdAt: "2026-09-05T18:31:00.000Z", cueIds: ["c9"] },
  ],
  comments: [],
  transcript: cues([
    ["Priya", 0, "Great to see you Jordan. Big picture, how's the last quarter felt on your side?"],
    ["Jordan", 40, "Mostly great. Usage is up, the two teams that adopted early are basically living in the product now."],
    ["Priya", 110, "That matches what we see — about eighteen percent up quarter over quarter. Anything getting in the way?"],
    ["Jordan", 170, "One real thorn: the SSO thing. People get logged out at random and my admins are the ones fielding complaints."],
    ["Priya", 240, "I'm sorry — that's exactly the kind of thing that erodes trust. Let me escalate it and get you a real timeline, not a shrug."],
    ["Jordan", 320, "Appreciated. It's not a dealbreaker, but it's visible."],
    ["Priya", 390, "Understood, I'll own it. On the good side — you mentioned expansion?"],
    ["Jordan", 450, "Yeah, we want to bring Support and Ops on next quarter. Probably around thirty seats."],
    ["Priya", 520, "That's fantastic. I'll get you a quote this week. One ask from you — what would make reporting a slam dunk at renewal?"],
    ["Jordan", 600, "Honestly, better cross-team reporting. If that's on the roadmap I'm not looking anywhere else."],
    ["Priya", 680, "Let's book a roadmap session with our product team so you hear it straight from them."],
    ["Jordan", 740, "Perfect. Send me a couple of times."],
  ]),
};

// =========================================================================
// 1:1
// =========================================================================
const oneOnOne: Meeting = {
  id: "m_1on1_devon",
  title: "1:1 — Maya & Devon",
  platform: "meet",
  startedAt: "2026-09-04T15:00:00.000Z",
  durationS: 24 * 60 + 15,
  ownerId: "u_maya",
  isTeamShared: false,
  tags: ["1:1"],
  thumbnailHue: 160,
  recap:
    "Devon is energized by the reliability mandate but stretched thin; wants to grow toward a tech-lead role and asked for one report to be reassigned.",
  attendees: [
    { name: "Maya Chen", email: "maya@northwind.io", isHost: true, speakerLabel: "Maya", talkTimeS: 360, color: C.indigo },
    { name: "Devon Park", email: "devon@northwind.io", isHost: false, speakerLabel: "Devon", talkTimeS: 520, color: C.emerald },
  ],
  summaries: [
    {
      templateId: "one_on_one",
      sections: [
        { heading: "Wins", bullets: ["Shipped the incident dashboard; on-call morale visibly better."] },
        { heading: "Challenges", bullets: ["Spread across reliability plus two feature reviews — context-switching is hurting focus."] },
        { heading: "Growth", bullets: ["Wants to grow into a tech-lead role; reliability workstream is a good proving ground."] },
        { heading: "Asks", bullets: ["Reassign one direct report to rebalance load.", "More explicit air cover to say no to feature asks during the push."] },
      ],
    },
  ],
  actionItems: [
    { id: "a1", text: "Rebalance Devon's load — move one report to Sam's pod", assignee: "Maya Chen", done: false, atMs: min(14) },
    { id: "a2", text: "Draft a tech-lead growth plan with concrete milestones", assignee: "Maya Chen", done: false, atMs: min(19) },
  ],
  highlights: [
    { id: "h1", startMs: min(13), endMs: min(15), label: "Ask: rebalance load", createdBy: "Maya Chen", createdAt: "2026-09-04T15:20:00.000Z", cueIds: ["c5"] },
  ],
  comments: [],
  transcript: cues([
    ["Maya", 0, "How are you doing, honestly? Not the status-update version."],
    ["Devon", 40, "Honestly, energized but stretched. The reliability mandate is the thing I've wanted for a year."],
    ["Devon", 110, "But I'm also in two feature reviews a week, and the context-switching is killing my deep-work time."],
    ["Maya", 180, "That's fair. If we could take one thing off your plate, what would move the needle most?"],
    ["Devon", 250, "If one of my reports moved to Sam's pod, I could actually focus. And some air cover to say no to feature asks during the push."],
    ["Maya", 330, "Both reasonable. Let me rebalance — I'll move one report and I'll be explicit with the team that reliability comes first for you right now."],
    ["Devon", 410, "That would help a lot. Longer term, I want to be moving toward a tech-lead role."],
    ["Maya", 480, "Good — the reliability workstream is a perfect proving ground. Let me draft a growth plan with real milestones so it's not vague."],
    ["Devon", 550, "I'd love that."],
  ]),
};

export const MEETINGS: Meeting[] = [roadmap, salesCall, csCall, oneOnOne];

export const CALENDAR: CalendarEvent[] = [
  {
    id: "cal1",
    title: "Weekly Product Sync",
    startAt: "2026-09-10T16:00:00.000Z",
    durationS: 30 * 60,
    platform: "zoom",
    attendees: ["Maya Chen", "Devon Park", "Priya Nair", "Sam Rivera"],
    willRecord: true,
  },
  {
    id: "cal2",
    title: "Brightwave — Technical Follow-up",
    startAt: "2026-09-10T18:30:00.000Z",
    durationS: 45 * 60,
    platform: "meet",
    attendees: ["Sam Rivera", "Alex Turner", "Dana Foster"],
    willRecord: true,
  },
  {
    id: "cal3",
    title: "Design Review — Tokens v2",
    startAt: "2026-09-11T14:00:00.000Z",
    durationS: 30 * 60,
    platform: "teams",
    attendees: ["Hannah Weiss", "Maya Chen"],
    willRecord: false,
  },
];

export { initials };
