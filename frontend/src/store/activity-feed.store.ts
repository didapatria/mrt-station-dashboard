import { create } from "zustand";

export interface FeedEntry {
  id: string;
  message: string;
  detail?: string;
  time: Date;
}

interface ActivityFeedStore {
  events: FeedEntry[];
  push: (entry: Pick<FeedEntry, "message" | "detail">) => void;
}

export const useActivityFeedStore = create<ActivityFeedStore>((set) => ({
  events: [],
  push: ({ message, detail }) =>
    set((state) => ({
      events: [
        { id: crypto.randomUUID(), message, detail, time: new Date() },
        ...state.events,
      ].slice(0, 30),
    })),
}));
