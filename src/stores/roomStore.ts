import { create } from "zustand";
import type { Room, RoomPlayer, Message, BattlePhase } from "@/types";

interface RoomState {
  currentRoom: Room | null;
  players: RoomPlayer[];
  messages: Message[];
  phase: BattlePhase;
  isReady: boolean;
  setRoom: (room: Room | null) => void;
  setPlayers: (players: RoomPlayer[]) => void;
  addPlayer: (player: RoomPlayer) => void;
  removePlayer: (userId: string) => void;
  updatePlayerReady: (userId: string, isReady: boolean) => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setPhase: (phase: BattlePhase) => void;
  setReady: (ready: boolean) => void;
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  players: [],
  messages: [],
  phase: "lobby",
  isReady: false,

  setRoom: (room) => set({ currentRoom: room }),
  setPlayers: (players) => set({ players }),
  addPlayer: (player) =>
    set((state) => ({
      players: state.players.some((p) => p.userId === player.userId)
        ? state.players
        : [...state.players, player],
    })),
  removePlayer: (userId) =>
    set((state) => ({
      players: state.players.filter((p) => p.userId !== userId),
    })),
  updatePlayerReady: (userId, isReady) =>
    set((state) => ({
      players: state.players.map((p) =>
        p.userId === userId ? { ...p, isReady } : p
      ),
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setMessages: (messages) => set({ messages }),
  setPhase: (phase) => set({ phase }),
  setReady: (ready) => set({ isReady: ready }),
  reset: () =>
    set({
      currentRoom: null,
      players: [],
      messages: [],
      phase: "lobby",
      isReady: false,
    }),
}));
