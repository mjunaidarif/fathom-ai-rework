"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { USERS, CURRENT_USER_ID } from "./seed";
import type { CalendarEvent, Comment, Highlight, Meeting } from "./types";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";
const api = (p: string) => `${BASE}${p}`;

interface Playlist {
  id: string;
  name: string;
  highlightRefs: { meetingId: string; highlightId: string }[];
}

interface StoreValue {
  meetings: Meeting[];
  playlists: Playlist[];
  calendar: CalendarEvent[];
  currentUser: (typeof USERS)[number];
  hydrated: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getMeeting: (id: string) => Meeting | undefined;
  addMeeting: (meeting: Meeting) => void;
  deleteMeeting: (id: string) => void;
  toggleActionItem: (meetingId: string, itemId: string) => void;
  addHighlight: (
    meetingId: string,
    h: Omit<Highlight, "id" | "createdAt" | "createdBy">,
  ) => Promise<void>;
  removeHighlight: (meetingId: string, highlightId: string) => void;
  addComment: (meetingId: string, atMs: number, body: string) => void;
  createPlaylist: (name: string) => Promise<string>;
  addToPlaylist: (playlistId: string, meetingId: string, highlightId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = useMemo(() => USERS.find((u) => u.id === CURRENT_USER_ID)!, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [mRes, pRes, cRes] = await Promise.all([
        fetch(api("/api/meetings")),
        fetch(api("/api/playlists")),
        fetch(api("/api/calendar")),
      ]);
      if (!mRes.ok || !pRes.ok) throw new Error("Failed to load data");
      const mJson = await mRes.json();
      const pJson = await pRes.json();
      const cJson = cRes.ok ? await cRes.json() : { events: [] };
      setMeetings(mJson.meetings ?? []);
      setPlaylists(pJson.playlists ?? []);
      setCalendar(cJson.events ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getMeeting = useCallback((id: string) => meetings.find((m) => m.id === id), [meetings]);

  const patchMeeting = useCallback((meetingId: string, fn: (m: Meeting) => Meeting) => {
    setMeetings((list) => list.map((m) => (m.id === meetingId ? fn(m) : m)));
  }, []);

  const addMeeting = useCallback((meeting: Meeting) => {
    setMeetings((list) => [meeting, ...list.filter((m) => m.id !== meeting.id)]);
  }, []);

  const deleteMeeting = useCallback((id: string) => {
    setMeetings((list) => list.filter((m) => m.id !== id));
    setPlaylists((pls) =>
      pls.map((p) => ({ ...p, highlightRefs: p.highlightRefs.filter((r) => r.meetingId !== id) })),
    );
    fetch(api(`/api/meetings/${id}`), { method: "DELETE" }).catch(() => {});
  }, []);

  const toggleActionItem = useCallback(
    (meetingId: string, itemId: string) => {
      patchMeeting(meetingId, (m) => ({
        ...m,
        actionItems: m.actionItems.map((a) => (a.id === itemId ? { ...a, done: !a.done } : a)),
      }));
      fetch(api(`/api/action-items/${itemId}`), { method: "PATCH" }).catch(() => {
        // revert on failure
        patchMeeting(meetingId, (m) => ({
          ...m,
          actionItems: m.actionItems.map((a) => (a.id === itemId ? { ...a, done: !a.done } : a)),
        }));
      });
    },
    [patchMeeting],
  );

  const addHighlight = useCallback<StoreValue["addHighlight"]>(
    async (meetingId, h) => {
      const res = await fetch(api("/api/highlights"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, ...h, createdBy: currentUser.name }),
      });
      if (!res.ok) return;
      const { highlight } = (await res.json()) as { highlight: Highlight };
      patchMeeting(meetingId, (m) => ({
        ...m,
        highlights: [...m.highlights, highlight].sort((a, b) => a.startMs - b.startMs),
      }));
    },
    [patchMeeting, currentUser.name],
  );

  const removeHighlight = useCallback(
    (meetingId: string, highlightId: string) => {
      patchMeeting(meetingId, (m) => ({
        ...m,
        highlights: m.highlights.filter((h) => h.id !== highlightId),
      }));
      setPlaylists((pls) =>
        pls.map((p) => ({
          ...p,
          highlightRefs: p.highlightRefs.filter((r) => r.highlightId !== highlightId),
        })),
      );
      fetch(api(`/api/highlights/${highlightId}`), { method: "DELETE" }).catch(() => {});
    },
    [patchMeeting],
  );

  const addComment = useCallback(
    (meetingId: string, atMs: number, body: string) => {
      fetch(api("/api/comments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, atMs, body, author: currentUser.name }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { comment: Comment } | null) => {
          if (!data) return;
          patchMeeting(meetingId, (m) => ({
            ...m,
            comments: [...m.comments, data.comment].sort((a, b) => a.atMs - b.atMs),
          }));
        })
        .catch(() => {});
    },
    [patchMeeting, currentUser.name],
  );

  const createPlaylist = useCallback<StoreValue["createPlaylist"]>(async (name) => {
    const res = await fetch(api("/api/playlists"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, ownerId: CURRENT_USER_ID }),
    });
    const { playlist } = (await res.json()) as { playlist: Playlist };
    setPlaylists((pls) => [...pls, playlist]);
    return playlist.id;
  }, []);

  const addToPlaylist = useCallback((playlistId: string, meetingId: string, highlightId: string) => {
    setPlaylists((pls) =>
      pls.map((p) =>
        p.id === playlistId &&
        !p.highlightRefs.some((r) => r.meetingId === meetingId && r.highlightId === highlightId)
          ? { ...p, highlightRefs: [...p.highlightRefs, { meetingId, highlightId }] }
          : p,
      ),
    );
    fetch(api(`/api/playlists/${playlistId}/items`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId, highlightId }),
    }).catch(() => {});
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      meetings,
      playlists,
      calendar,
      currentUser,
      hydrated,
      loading,
      error,
      refresh,
      getMeeting,
      addMeeting,
      deleteMeeting,
      toggleActionItem,
      addHighlight,
      removeHighlight,
      addComment,
      createPlaylist,
      addToPlaylist,
    }),
    [
      meetings,
      playlists,
      calendar,
      currentUser,
      hydrated,
      loading,
      error,
      refresh,
      getMeeting,
      addMeeting,
      deleteMeeting,
      toggleActionItem,
      addHighlight,
      removeHighlight,
      addComment,
      createPlaylist,
      addToPlaylist,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export type { Playlist };
