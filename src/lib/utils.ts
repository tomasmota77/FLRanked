import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Rank } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRankFromElo(elo: number): Rank {
  if (elo >= 3000) return "MASTER";
  if (elo >= 2500) return "DIAMOND";
  if (elo >= 2000) return "PLATINUM";
  if (elo >= 1500) return "GOLD";
  if (elo >= 1000) return "SILVER";
  return "BRONZE";
}

export function calculateEloChange(
  winnerElo: number,
  loserElo: number,
  k: number = 32
): { winnerGain: number; loserLoss: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

  const winnerGain = Math.round(k * (1 - expectedWinner));
  const loserLoss = Math.round(k * (0 - expectedLoser));

  return { winnerGain, loserLoss: Math.abs(loserLoss) };
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function getWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function getXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getLevelFromXP(xp: number): number {
  let level = 1;
  let xpNeeded = 100;
  let totalXp = 0;

  while (totalXp + xpNeeded <= xp) {
    totalXp += xpNeeded;
    level++;
    xpNeeded = getXpForLevel(level);
  }

  return level;
}

export function getXpProgress(xp: number): { level: number; current: number; needed: number; percentage: number } {
  const level = getLevelFromXP(xp);
  let totalXpForLevel = 0;
  for (let i = 1; i < level; i++) {
    totalXpForLevel += getXpForLevel(i);
  }
  const current = xp - totalXpForLevel;
  const needed = getXpForLevel(level);
  const percentage = Math.round((current / needed) * 100);

  return { level, current, needed, percentage };
}

export function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}
