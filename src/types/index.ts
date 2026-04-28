// ============================================
// FLRanked Type Definitions
// ============================================

export type RoomType = "ONE_V_ONE" | "FOUR_PLAYERS" | "EIGHT_PLAYERS" | "TOURNAMENT";
export type RoomStatus = "WAITING" | "IN_PROGRESS" | "VOTING" | "FINISHED";
export type Rank = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | "DIAMOND" | "MASTER";
export type UserRole = "USER" | "MODERATOR" | "ADMIN";
export type BattlePhase = "lobby" | "countdown" | "battle" | "uploading" | "voting" | "results";

export interface User {
  id: string;
  username: string;
  email: string;
  image?: string | null;
  role: UserRole;
  elo: number;
  xp: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  rank: Rank;
  bio?: string | null;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  maxPlayers: number;
  status: RoomStatus;
  isPrivate: boolean;
  bpm: number;
  genre: string;
  theme?: string | null;
  timerMinutes: number;
  hostId: string;
  host?: User;
  players?: RoomPlayer[];
  _count?: {
    players: number;
  };
  createdAt: string;
}

export interface RoomPlayer {
  id: string;
  roomId: string;
  userId: string;
  isReady: boolean;
  user?: User;
}

export interface Battle {
  id: string;
  roomId: string;
  samplePackId?: string | null;
  startedAt: string;
  endedAt?: string | null;
  winnerId?: string | null;
  bpm: number;
  genre: string;
  theme?: string | null;
  timerMinutes: number;
  status: RoomStatus;
  room?: Room;
  samplePack?: SamplePack;
  submissions?: Submission[];
  votes?: Vote[];
}

export interface SamplePack {
  id: string;
  name: string;
  genre: string;
  files: SampleFile[];
}

export interface SampleFile {
  name: string;
  url: string;
  type: "oneshot" | "snare" | "808" | "kick" | "perc" | "hihat" | "clap" | "openhat";
  label: string;
}

export interface Submission {
  id: string;
  userId: string;
  battleId: string;
  audioUrl: string;
  fileName: string;
  createdAt: string;
  user?: User;
  votes?: Vote[];
  _count?: {
    votes: number;
  };
}

export interface Vote {
  id: string;
  voterId: string;
  submissionId: string;
  battleId: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  roomId: string;
  user?: User;
  createdAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  image?: string | null;
  elo: number;
  wins: number;
  losses: number;
  streak: number;
  rank: Rank;
  position: number;
}

// Rank configuration
export const RANK_CONFIG: Record<Rank, { label: string; color: string; minElo: number; icon: string }> = {
  BRONZE: { label: "Bronze", color: "#CD7F32", minElo: 0, icon: "🥉" },
  SILVER: { label: "Silver", color: "#C0C0C0", minElo: 1000, icon: "🥈" },
  GOLD: { label: "Gold", color: "#FFD700", minElo: 1500, icon: "🥇" },
  PLATINUM: { label: "Platinum", color: "#00CED1", minElo: 2000, icon: "💎" },
  DIAMOND: { label: "Diamond", color: "#B9F2FF", minElo: 2500, icon: "💠" },
  MASTER: { label: "Master", color: "#39FF14", minElo: 3000, icon: "👑" },
};

// Sample pack structure for Trap battles
export const TRAP_SAMPLE_STRUCTURE: { type: SampleFile["type"]; label: string; count: number }[] = [
  { type: "oneshot", label: "One-Shot", count: 3 },
  { type: "snare", label: "Snare", count: 1 },
  { type: "808", label: "808", count: 1 },
  { type: "kick", label: "Kick", count: 1 },
  { type: "perc", label: "Perc", count: 1 },
  { type: "hihat", label: "Hi-Hat", count: 1 },
  { type: "clap", label: "Clap", count: 1 },
  { type: "openhat", label: "Open Hat", count: 1 },
];
