import { create } from "zustand";
import type { Battle, Submission, SamplePack, BattlePhase } from "@/types";

interface BattleState {
  battle: Battle | null;
  samplePack: SamplePack | null;
  submissions: Submission[];
  mySubmission: Submission | null;
  timeRemaining: number;
  phase: BattlePhase;
  votedFor: string | null;
  results: Submission[];

  setBattle: (battle: Battle | null) => void;
  setSamplePack: (pack: SamplePack | null) => void;
  setSubmissions: (subs: Submission[]) => void;
  setMySubmission: (sub: Submission | null) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  setPhase: (phase: BattlePhase) => void;
  setVotedFor: (id: string | null) => void;
  setResults: (results: Submission[]) => void;
  reset: () => void;
}

export const useBattleStore = create<BattleState>((set) => ({
  battle: null,
  samplePack: null,
  submissions: [],
  mySubmission: null,
  timeRemaining: 0,
  phase: "lobby",
  votedFor: null,
  results: [],

  setBattle: (battle) => set({ battle }),
  setSamplePack: (pack) => set({ samplePack: pack }),
  setSubmissions: (subs) => set({ submissions: subs }),
  setMySubmission: (sub) => set({ mySubmission: sub }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  decrementTime: () =>
    set((state) => ({
      timeRemaining: Math.max(0, state.timeRemaining - 1),
    })),
  setPhase: (phase) => set({ phase }),
  setVotedFor: (id) => set({ votedFor: id }),
  setResults: (results) => set({ results }),
  reset: () =>
    set({
      battle: null,
      samplePack: null,
      submissions: [],
      mySubmission: null,
      timeRemaining: 0,
      phase: "lobby",
      votedFor: null,
      results: [],
    }),
}));
