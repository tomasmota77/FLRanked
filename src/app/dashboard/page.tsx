"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Trophy,
  Swords,
  Target,
  TrendingUp,
  Flame,
  Star,
  Zap,
  Clock,
  Music,
  ChevronRight,
  Award,
  BarChart3,
  Loader2,
} from "lucide-react";

const RANK_COLORS: Record<string, string> = {
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#00CED1",
  DIAMOND: "#B9F2FF",
  MASTER: "#39FF14",
};

interface UserData {
  id: string;
  username: string;
  email: string;
  elo: number;
  xp: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  rank: string;
  bio: string | null;
  image: string | null;
  level: number;
  xpProgress: number;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/user/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Failed to load user:", data.error);
          } else {
            setUser(data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Could not load profile</h2>
        <Link href="/login" className="btn-neon text-sm">
          Sign In
        </Link>
      </div>
    );
  }

  const winRate =
    user.wins + user.losses > 0
      ? Math.round((user.wins / (user.wins + user.losses)) * 100)
      : 0;
  const rankColor = RANK_COLORS[user.rank] || "#C0C0C0";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold mb-2">Dashboard</h1>
        <p className="text-text-secondary">Track your progress and battle stats</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ═══════ Profile Card ═══════ */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-purple/5" />
            <div className="relative z-10">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-purple to-neon-green flex items-center justify-center text-2xl font-bold shadow-lg"
                  style={{ boxShadow: `0 0 20px ${rankColor}30` }}
                >
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{user.username}</h2>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: rankColor }}
                    >
                      {user.rank}
                    </span>
                    <span className="text-text-tertiary text-sm">•</span>
                    <span className="text-sm text-text-secondary">Level {user.level}</span>
                  </div>
                </div>
              </div>

              {/* ELO Display */}
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">ELO Rating</span>
                <span className="text-3xl font-display font-black" style={{ color: rankColor }}>
                  {user.elo}
                </span>
              </div>

              {/* XP Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-text-secondary">Level {user.level}</span>
                  <span className="text-neon-green">{user.xpProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-green-dim"
                    initial={{ width: 0 }}
                    animate={{ width: `${user.xpProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-xs text-text-tertiary mt-1">
                  {user.xp} XP
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <Link href="/rooms" className="btn-neon w-full !py-2.5 text-sm">
                  <Swords className="w-4 h-4" />
                  Find a Battle
                </Link>
                <Link href={`/profile/${user.username}`} className="btn-ghost w-full !py-2.5 text-sm">
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════ Stats & History ═══════ */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Wins", value: user.wins, icon: Trophy, color: "text-green-500" },
              { label: "Losses", value: user.losses, icon: Target, color: "text-pink-500" },
              { label: "Win Rate", value: `${winRate}%`, icon: BarChart3, color: "text-cyan-500" },
              { label: "Streak", value: user.streak, icon: Flame, color: "text-orange-500", suffix: user.streak > 0 ? "🔥" : "" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="bg-[#1a1a25] border border-white/5 p-4 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-display font-bold mt-1">
                  {stat.value}
                  {stat.suffix && <span className="ml-1 text-base">{stat.suffix}</span>}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Match History - Empty State for new users */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-text-tertiary" />
                Recent Matches
              </h3>
            </div>

            {user.wins + user.losses === 0 ? (
              <div className="text-center py-8">
                <Swords className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
                <h4 className="font-bold mb-1">No battles yet</h4>
                <p className="text-sm text-text-secondary mb-4">
                  Join a room and compete in your first beat battle!
                </p>
                <Link href="/rooms" className="btn-neon text-sm">
                  <Swords className="w-4 h-4" />
                  Find a Battle
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 text-sm text-text-tertiary">
                Match history will appear here after battles.
              </div>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}
