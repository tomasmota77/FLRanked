"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Users,
  DoorOpen,
  Music,
  AlertTriangle,
  Ban,
  Trash2,
  Upload,
  Settings,
  Search,
  ChevronRight,
  FileAudio,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Loader2,
  RefreshCcw,
} from "lucide-react";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("rooms");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ users: 0, rooms: 0, samples: 0, reports: 0 });
  const [data, setData] = useState<any[]>([]);

  // Protection check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && (session?.user as any)?.role !== "ADMIN") {
      router.push("/");
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (res.ok) setStats(json);
    } catch (err) {
      console.error("Failed to fetch admin stats", err);
    }
  };

  const fetchData = async (tab: string, query: string = "") => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/${tab}?query=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (err) {
      console.error(`Failed to fetch admin ${tab}`, err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === "ADMIN") {
      fetchStats();
      fetchData(activeTab, search);
    }
  }, [status, session, activeTab]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(activeTab, search);
  };

  if (status === "loading" || (status === "authenticated" && (session?.user as any)?.role !== "ADMIN")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  const TABS = [
    { id: "rooms", label: "Rooms", icon: DoorOpen, count: stats.rooms },
    { id: "users", label: "Users", icon: Users, count: stats.users },
    { id: "reports", label: "Reports", icon: AlertTriangle, count: stats.reports },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-neon-purple shadow-neon-purple-glow" />
            Admin Control Center
          </h1>
          <p className="text-text-secondary">System monitoring and management dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { fetchStats(); fetchData(activeTab, search); }}
            className="p-2 rounded-xl bg-bg-card border border-border-default hover:border-neon-purple/30 transition-all text-text-tertiary hover:text-neon-purple"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <div className="px-4 py-2 rounded-xl bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-sm font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
            System Live
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card p-4 sticky top-24">
            <div className="space-y-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearch(""); }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-neon-purple" : ""}`} />
                    {tab.label}
                  </div>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      tab.id === "reports" && tab.count > 0
                        ? "bg-neon-pink/10 text-neon-pink border border-neon-pink/20"
                        : "bg-bg-tertiary text-text-tertiary border border-border-default"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          className="lg:col-span-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${activeTab}...`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-default focus:border-neon-purple/50 outline-none text-sm transition-all shadow-lg"
              />
            </form>
          </div>

          <div className="glass-card min-h-[500px] overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
                <span className="text-xs font-bold uppercase tracking-widest text-text-tertiary">Accessing Database...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-text-tertiary" />
                </div>
                <h3 className="font-bold text-lg mb-1">No results found</h3>
                <p className="text-text-secondary text-sm">No data available for "{activeTab}" at the moment.</p>
              </div>
            ) : (
              <div className="divide-y divide-border-default/50">
                {/* Users Tab Render */}
                {activeTab === "users" && data.map((user) => (
                  <div key={user.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-green flex items-center justify-center text-sm font-bold text-white shadow-lg">
                        {(user.username?.[0] || "?").toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{user.username || "Anonymous User"}</span>
                          {user.role === "ADMIN" && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-purple/20 text-neon-purple font-black border border-neon-purple/30 uppercase">Staff</span>
                          )}
                        </div>
                        <div className="text-xs text-text-tertiary">{user.email} • Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <div className="text-sm font-mono text-neon-green">{user.elo} ELO</div>
                        <div className="text-[10px] uppercase font-bold text-text-tertiary">{user.rank}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => alert(`Banning ${user.username}...`)}
                          className="p-2 rounded-lg hover:bg-neon-pink/10 text-text-tertiary hover:text-neon-pink transition-colors"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Deleting ${user.username}...`)}
                          className="p-2 rounded-lg hover:bg-neon-pink/10 text-text-tertiary hover:text-neon-pink transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Rooms Tab Render */}
                {activeTab === "rooms" && data.map((room) => (
                  <div key={room.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center border border-border-default">
                        <DoorOpen className="w-5 h-5 text-text-secondary" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{room.name}</div>
                        <div className="text-xs text-text-tertiary">
                          Host: <span className="text-neon-purple">{room.host?.username || "Unknown"}</span> • {room._count?.players} players • {room.bpm} BPM
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold border ${
                        room.status === "WAITING" ? "bg-neon-green/10 text-neon-green border-neon-green/20" :
                        room.status === "IN_PROGRESS" ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                        "bg-bg-tertiary text-text-tertiary border-border-default"
                      }`}>
                        {room.status}
                      </span>
                      <button 
                        onClick={() => alert(`Managing room: ${room.name}`)}
                        className="p-2 rounded-lg hover:bg-white/10 text-text-tertiary hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Reports Tab Render */}
                {activeTab === "reports" && data.map((report) => (
                  <div key={report.id} className="p-4 flex items-start justify-between hover:bg-white/5 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-neon-pink/10 flex items-center justify-center border border-neon-pink/20">
                        <AlertTriangle className="w-5 h-5 text-neon-pink" />
                      </div>
                      <div>
                        <div className="text-sm">
                          <span className="font-bold text-neon-green">{report.reporter?.username}</span>
                          <span className="text-text-tertiary"> reported </span>
                          <span className="font-bold text-neon-pink">{report.reported?.username}</span>
                        </div>
                        <p className="text-sm text-text-secondary mt-1">{report.reason}</p>
                        <div className="text-[10px] text-text-tertiary mt-2 uppercase font-bold tracking-wider">
                          {new Date(report.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!report.resolved ? (
                        <>
                          <button className="p-2 rounded-lg bg-neon-green/10 text-neon-green hover:bg-neon-green/20 border border-neon-green/20 transition-all">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-neon-pink/10 text-neon-pink hover:bg-neon-pink/20 border border-neon-pink/20 transition-all">
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-text-tertiary uppercase tracking-widest bg-white/5 px-2 py-1 rounded">Resolved</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
