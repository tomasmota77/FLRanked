"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Trophy,
  Crown,
  TrendingUp,
  Flame,
  Search,
  Loader2,
} from "lucide-react";

interface Player {
  id: string;
  username: string;
  elo: number;
  wins: number;
  losses: number;
  streak: number;
  rank: string;
  image: string | null;
  position: number;
}

const RANK_COLORS: Record<string, string> = {
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#00CED1",
  DIAMOND: "#B9F2FF",
  MASTER: "#39FF14",
};

const RANK_ICONS: Record<string, string> = {
  BRONZE: "🥉",
  SILVER: "🥈",
  GOLD: "🥇",
  PLATINUM: "💎",
  DIAMOND: "💠",
  MASTER: "👑",
};

const TABS = [
  { id: "elo", label: "Top ELO", icon: Trophy },
  { id: "wins", label: "Most Wins", icon: Crown },
  { id: "streak", label: "Best Streak", icon: Flame },
];

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("elo");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setPlayers(data.players);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const sortedPlayers = [...players]
    .sort((a, b) => {
      switch (activeTab) {
        case "wins": return b.wins - a.wins;
        case "streak": return b.streak - a.streak;
        default: return b.elo - a.elo;
      }
    })
    .filter((p) => !search || p.username.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
        <p className="text-text-secondary font-medium">Loading Rankings...</p>
      </div>
    );
  }

  const top3 = sortedPlayers.slice(0, 3);
  // Reorder for podium: [2, 1, 3]
  const podium = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3 text-white">
          <Trophy className="w-8 h-8 text-rank-gold" />
          Leaderboard
        </h1>
        <p className="text-text-secondary">Top producers ranked by performance</p>
      </motion.div>

      {/* Top 3 Podium */}
      {podium.length > 0 && (
        <motion.div
          className="grid grid-cols-3 gap-4 mb-12 items-end max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {podium.map((player, i) => {
            const positions = [2, 1, 3];
            const displayPos = podium.length === 3 ? positions[i] : (i === 0 && podium.length === 2 ? 1 : 2);
            const isFirst = displayPos === 1;
            const heights = isFirst ? "h-32 sm:h-40" : (displayPos === 2 ? "h-24 sm:h-32" : "h-20 sm:h-24");
            const delays = [0.3, 0.2, 0.4];

            return (
              <Link key={player.id} href={`/profile/${player.username}`} className="group">
                <motion.div
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: delays[i] }}
                >
                  <div className="mb-2 relative">
                    <div
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center text-xl font-bold mx-auto group-hover:scale-110 transition-transform"
                      style={{
                        color: RANK_COLORS[player.rank],
                        boxShadow: `0 0 20px ${RANK_COLORS[player.rank]}30`,
                        border: `2px solid ${RANK_COLORS[player.rank]}40`
                      }}
                    >
                      {player.username[0].toUpperCase()}
                    </div>
                    {isFirst && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">👑</div>}
                  </div>
                  <div className="text-xs sm:text-sm font-bold truncate text-white mb-1">{player.username}</div>
                  <div
                    className={`mt-2 ${heights} rounded-t-2xl flex items-end justify-center pb-4 bg-gradient-to-t from-white/10 to-transparent border-t border-x border-white/10 group-hover:from-white/20 transition-all`}
                  >
                    <div>
                      <div className="text-2xl sm:text-3xl font-display font-black" style={{ color: RANK_COLORS[player.rank] }}>
                        #{displayPos}
                      </div>
                      <div className="text-[10px] sm:text-xs text-gray-500 font-mono font-bold">{player.elo} ELO</div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      )}

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                  : "bg-bg-card border border-border-default text-text-secondary hover:text-text-primary"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search player..."
            className="pl-10 pr-4 py-2 rounded-xl bg-bg-card border border-border-default focus:border-neon-green/50 outline-none text-sm w-full sm:w-60"
          />
        </div>
      </div>

      {/* Table */}
      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
          <div className="col-span-1">#</div>
          <div className="col-span-7">Producer</div>
          <div className="col-span-2 text-right">ELO</div>
          <div className="col-span-2 text-right">Wins</div>
        </div>

        <div className="divide-y divide-white/5">
          {sortedPlayers.map((player, i) => (
            <Link key={player.id} href={`/profile/${player.username}`}>
              <motion.div
                className="grid grid-cols-12 gap-2 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                <div className="col-span-1">
                  <span className={`font-display font-black text-sm ${
                    i < 3 ? "text-rank-gold" : "text-text-tertiary"
                  }`}>
                    {i + 1}
                  </span>
                </div>
                <div className="col-span-7 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-xs font-bold border border-white/10 group-hover:scale-110 transition-transform"
                    style={{ color: RANK_COLORS[player.rank] }}
                  >
                    {player.username[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-white group-hover:text-neon-green transition-colors truncate">
                      {player.username}
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: RANK_COLORS[player.rank] }}>
                      {RANK_ICONS[player.rank]} {player.rank}
                    </div>
                  </div>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-mono font-bold" style={{ color: RANK_COLORS[player.rank] }}>
                    {player.elo}
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm font-bold text-text-secondary">{player.wins}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
