# Fathom — Product Recon & Data Model

Recon of [fathom.video](https://fathom.video) marketing + pricing surface, plus
prior product knowledge. The in-product (authenticated) walkthrough is tracked
separately — see the note at the end.

## What Fathom is

An AI meeting notetaker. It joins (or, in bot-free beta, locally captures) your
Zoom / Google Meet / Microsoft Teams calls, records + transcribes them, and
turns each call into: an AI summary, action items, searchable transcript,
highlights/clips, and follow-up emails — synced out to Slack / CRM / Notion /
Asana. A conversational assistant ("Ask Fathom") answers questions across one
call or your whole call history.

## Core user-facing surfaces (what actually gets judged)

1. **Meeting library** — list of past meetings with title, date, duration,
   attendees, thumbnail, summary snippet. Filter/sort. "My Calls" vs "Team Calls".
2. **Meeting detail / playback** — video (or audio) player with the transcript
   scrolling in sync; click a transcript line to seek; speaker labels; search
   within the call.
3. **AI summary** — structured summary generated from the transcript, with
   **switchable templates** (general, sales/discovery, standup, 1:1, interview…).
4. **Action items** — extracted tasks, with assignee/owner where inferable.
5. **Highlights & clips** — mark a moment during/after the call; it lands as a
   timestamped highlight; collect highlights into **playlists**; share a clip
   with someone who wasn't on the call (public share link).
6. **Search across meetings** — global keyword/attendee search returning
   matching moments across calls; "Ask Fathom" natural-language Q&A over calls.
7. **Sharing** — share a call, a clip, or a playlist via link; comments & mentions.
8. **Calendar connection** — connect Google/Microsoft calendar; upcoming
   meetings show whether the notetaker will join.

## Plan/feature taxonomy (from pricing)

- **Free:** unlimited recordings + transcription, instant AI summaries, clips +
  playlists + search across calls, bot or bot-free capture, LLM integrations.
- **Premium ($16):** advanced summaries, AI action items, Ask Fathom (single call), custom bot.
- **Team ($15/user):** global search across calls, team playlists, comments/folders/keyword alerts.
- **Business ($25):** CRM field sync, deal view, coaching metrics/scorecards, custom summaries.
- **Enterprise ($35):** SSO/SCIM, retention policies, org security controls.

Compliance signals: SOC 2 Type II, GDPR, HIPAA. Integrations: Google Meet, Zoom,
Teams, Gmail, Slack, Salesforce, HubSpot, Notion, Asana, Zapier/Make, Claude & ChatGPT, MCP/public API.

## Proposed data model for the rebuild

```
User            id, name, email, avatar_url, plan
Meeting         id, owner_id, title, platform (zoom|meet|teams), started_at,
                duration_s, recording_url, thumbnail_url, status, is_team_shared
Attendee        id, meeting_id, name, email, is_host, speaker_label, talk_time_s
TranscriptCue   id, meeting_id, speaker_label, start_ms, end_ms, text
Summary         id, meeting_id, template_id, sections[] (heading, bullets[]),
                generated_at
SummaryTemplate id, name, description, section_spec (for regeneration)
ActionItem      id, meeting_id, text, assignee (attendee_id?), done, source_cue_id
Highlight       id, meeting_id, created_by, start_ms, end_ms, label, note, created_at
Playlist        id, owner_id, name  +  PlaylistItem(playlist_id, highlight_id, order)
Comment         id, meeting_id, at_ms, author_id, body, created_at
ShareLink       id, resource_type (meeting|clip|playlist), resource_id, token, expires_at
CalendarEvent   id, user_id, title, start_at, attendees[], will_record
```

## Build strategy (per the brief's allowance to stub capture)

The brief explicitly permits stubbing the capture/recording bot. Plan: **stub the
capture layer** (seed realistic recordings + transcripts) and spend the time on
the judged surface — library, synced playback+transcript, templated summaries,
action items, highlights→playlists, cross-meeting search + Ask-Fathom, and
shareable clips. Seed with several realistic meetings (incl. one 8-person,
~1-hour call) so the library isn't empty.

## Authenticated walkthrough — status

Signing up and connecting a real calendar require account creation / OAuth, which
must be done by the account owner (I can't create accounts or authenticate as the
user). Options for capturing the real in-product flows are being decided with the
user; the rebuild proceeds against the model above in the meantime.
```
