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
import { MEETINGS as SEED_MEETINGS, USERS, CURRENT_USER_ID } from "./seed";
import type { ActionItem, Comment, Highlight, Meeting } from "./types";

const LS_KEY = "fathom-rework-state-v1";

interface Playlist {
  id: string;
  name: string;
  highlightRefs: { meetingId: string; highlightId: string }[];
}

interface PersistState {
  meetings: Meeting[];
  playlists: Playlist[];
}

interface StoreValue extends PersistState {
  currentUser: (typeof USERS)[number];
  hydrated: boolean;
  getMeeting: (id: string) => Meeting | undefined;
  addMeeting: (meeting: Meeting) => void;
  toggleActionItem: (meetingId: string, itemId: string) => void;
  addHighlight: (meetingId: string, h: Omit<Highlight, "id" | "createdAt" | "createdBy">) => void;
  removeHighlight: (meetingId: string, highlightId: string) => void;
  addComment: (meetingId: string, atMs: number, body: string) => void;
  createPlaylist: (name: string) => string;
  addToPlaylist: (playlistId: string, meetingId: string, highlightId: string) => void;
  reset: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function loadInitial(): PersistState {
  const base: PersistState = {
    meetings: structuredClone(SEED_MEETINGS),
    playlists: [
      {
        id: "pl_wins",
        name: "Team wins & decisions",
        highlightRefs: [
          { meetingId: "m_roadmap_q3", highlightId: "h1" },
          { meetingId: "m_cs_acme", highlightId: "h2" },
        ],
      },
    ],
  };
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as PersistState;
  } catch {
    /* ignore */
  }
  return base;
}

let uid = 0;
const nextId = (p: string) => `${p}_${Date.now().toString(36)}_${uid++}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistState>(() => loadInitial());
  const [hydrated, setHydrated] = useState(false);

  // Re-read from localStorage on mount (SSR/export renders with seed).
  useEffect(() => {
    setState(loadInitial());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, hydrated]);

  const getMeeting = useCallback(
    (id: string) => state.meetings.find((m) => m.id === id),
    [state.meetings],
  );

  const addMeeting = useCallback((meeting: Meeting) => {
    setState((s) => ({ ...s, meetings: [meeting, ...s.meetings] }));
  }, []);

  const mutateMeeting = useCallback(
    (meetingId: string, fn: (m: Meeting) => Meeting) => {
      setState((s) => ({
        ...s,
        meetings: s.meetings.map((m) => (m.id === meetingId ? fn(m) : m)),
      }));
    },
    [],
  );

  const toggleActionItem = useCallback(
    (meetingId: string, itemId: string) =>
      mutateMeeting(meetingId, (m) => ({
        ...m,
        actionItems: m.actionItems.map((a: ActionItem) =>
          a.id === itemId ? { ...a, done: !a.done } : a,
        ),
      })),
    [mutateMeeting],
  );

  const addHighlight = useCallback(
    (meetingId: string, h: Omit<Highlight, "id" | "createdAt" | "createdBy">) =>
      mutateMeeting(meetingId, (m) => ({
        ...m,
        highlights: [
          ...m.highlights,
          {
            ...h,
            id: nextId("h"),
            createdAt: new Date().toISOString(),
            createdBy: USERS.find((u) => u.id === CURRENT_USER_ID)!.name,
          },
        ].sort((a, b) => a.startMs - b.startMs),
      })),
    [mutateMeeting],
  );

  const removeHighlight = useCallback(
    (meetingId: string, highlightId: string) =>
      mutateMeeting(meetingId, (m) => ({
        ...m,
        highlights: m.highlights.filter((h: Highlight) => h.id !== highlightId),
      })),
    [mutateMeeting],
  );

  const addComment = useCallback(
    (meetingId: string, atMs: number, body: string) =>
      mutateMeeting(meetingId, (m) => ({
        ...m,
        comments: [
          ...m.comments,
          {
            id: nextId("cm"),
            atMs,
            author: USERS.find((u) => u.id === CURRENT_USER_ID)!.name,
            body,
            createdAt: new Date().toISOString(),
          } as Comment,
        ].sort((a, b) => a.atMs - b.atMs),
      })),
    [mutateMeeting],
  );

  const createPlaylist = useCallback((name: string) => {
    const id = nextId("pl");
    setState((s) => ({ ...s, playlists: [...s.playlists, { id, name, highlightRefs: [] }] }));
    return id;
  }, []);

  const addToPlaylist = useCallback(
    (playlistId: string, meetingId: string, highlightId: string) => {
      setState((s) => ({
        ...s,
        playlists: s.playlists.map((p) =>
          p.id === playlistId &&
          !p.highlightRefs.some((r) => r.meetingId === meetingId && r.highlightId === highlightId)
            ? { ...p, highlightRefs: [...p.highlightRefs, { meetingId, highlightId }] }
            : p,
        ),
      }));
    },
    [],
  );

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
    setState(loadInitial());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      currentUser: USERS.find((u) => u.id === CURRENT_USER_ID)!,
      hydrated,
      getMeeting,
      addMeeting,
      toggleActionItem,
      addHighlight,
      removeHighlight,
      addComment,
      createPlaylist,
      addToPlaylist,
      reset,
    }),
    [
      state,
      hydrated,
      getMeeting,
      addMeeting,
      toggleActionItem,
      addHighlight,
      removeHighlight,
      addComment,
      createPlaylist,
      addToPlaylist,
      reset,
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
