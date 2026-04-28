"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Send,
  Crown,
  CheckCircle2,
  Circle,
  Settings,
  Swords,
  Music,
  Clock,
  UserX,
  Play,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  X,
  Save,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Chat from "@/components/Chat";

const RANK_COLORS: Record<string, string> = {
  BRONZE: "#CD7F32",
  SILVER: "#C0C0C0",
  GOLD: "#FFD700",
  PLATINUM: "#00CED1",
  DIAMOND: "#B9F2FF",
  MASTER: "#39FF14",
};

export default function RoomLobbyPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [joinError, setJoinError] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [roomSettings, setRoomSettings] = useState({
    name: "",
    bpm: "140",
    timerMinutes: "10",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const roomId = params.id as string;

  const fetchRoom = useCallback(async (isRetry = false) => {
    if (!roomId) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Fetch room error (${res.status}):`, errorText);
        if (!isRetry) {
          setTimeout(() => fetchRoom(true), 1000);
          return;
        }
        throw new Error("Room not found");
      }
      const data = await res.json();

      // If room moved to IN_PROGRESS, redirect all clients to battle page
      if (data.status === "IN_PROGRESS") {
        router.push(`/battle/${roomId}`);
        return;
      }

      setRoom(data);

      // Sync ready state from server
      if (session?.user?.id) {
        const me = data.players.find((p: any) => p.id === session.user.id);
        if (me) setIsReady(me.isReady);
      }

      // Initialize settings form
      setRoomSettings({
        name: data.name,
        bpm: data.bpm.toString(),
        timerMinutes: data.timerMinutes.toString(),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, session?.user?.id, router]);

  // Auto-join on mount
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user?.id) return;

    const joinAndFetch = async () => {
      try {
        const res = await fetch(`/api/rooms/${roomId}/join`, { method: "POST" });
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Join room error (${res.status}):`, errorText);
          try {
            const data = JSON.parse(errorText);
            if (data.error !== "Room is not accepting players" && data.error === "Room is full") {
              setJoinError(data.error);
            }
          } catch (e) {
            // Not JSON, already logged errorText
          }
        } else {
          await res.json(); // Consuming the body
        }
      } catch (err) {
        console.error("Join error:", err);
      }
      await fetchRoom();
    };

    joinAndFetch();
  }, [sessionStatus, session?.user?.id, roomId, fetchRoom]);

  // Heartbeat and Leave Room
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user?.id) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`/api/rooms/${roomId}/heartbeat`, { method: "POST" });
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    }, 10000); // Heartbeat every 10 seconds

    const handleLeave = () => {
      // Use sendBeacon for reliable leave on tab close
      navigator.sendBeacon(`/api/rooms/${roomId}/leave`);
    };

    window.addEventListener("beforeunload", handleLeave);

    return () => {
      clearInterval(heartbeatInterval);
      window.removeEventListener("beforeunload", handleLeave);
      // We do NOT call handleLeave() here because React Strict Mode unmounts
      // components immediately in dev, causing players to be removed right after joining.
      // If a user navigates away within the app, the heartbeat will stop, and the server
      // will clean them up after 30 seconds.
    };
  }, [sessionStatus, session?.user?.id, roomId]);

  // Poll every 3 seconds
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(fetchRoom, 3000);
    return () => clearInterval(interval);
  }, [isLoading, fetchRoom]);


  const toggleReady = async () => {
    const newReady = !isReady;
    setIsReady(newReady); // optimistic update
    try {
      await fetch(`/api/rooms/${roomId}/ready`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isReady: newReady }),
      });
    } catch (err) {
      setIsReady(!newReady); // revert on error
      console.error("Ready toggle error:", err);
    }
  };

  const handleStartBattle = async () => {
    setIsStarting(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}/start`, { method: "POST" });
      if (res.ok) {
        router.push(`/battle/${roomId}`);
      } else {
        const errorText = await res.text();
        console.error(`Start battle error (${res.status}):`, errorText);
        try {
          const data = JSON.parse(errorText);
          alert(data.error || "Failed to start battle");
        } catch (e) {
          alert("Failed to start battle. See console for details.");
        }
        setIsStarting(false);
      }
    } catch (err) {
      console.error("Start battle error:", err);
      setIsStarting(false);
    }
  };


  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomSettings.name,
          bpm: roomSettings.bpm,
          timerMinutes: roomSettings.timerMinutes,
        }),
      });
      if (res.ok) {
        await fetchRoom();
        setShowSettings(false);
      } else {
        const errorText = await res.text();
        console.error(`Update settings error (${res.status}):`, errorText);
        try {
          const data = JSON.parse(errorText);
          alert(data.error || "Failed to update settings");
        } catch (e) {
          alert("Failed to update settings. See console for details.");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
      </div>
    );
  }

  if (sessionStatus === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (joinError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-neon-orange" />
        <h2 className="text-2xl font-bold">{joinError}</h2>
        <Link href="/rooms" className="btn-neon text-sm">Back to Rooms</Link>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">Room not found</h2>
        <Link href="/rooms" className="btn-neon text-sm">Back to Rooms</Link>
      </div>
    );
  }

  const isHost = room.players.find((p: any) => p.id === session?.user?.id)?.isHost;
  const allReady = room.players.length > 0 && room.players.every((p: any) => p.isReady);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/rooms" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Rooms
      </Link>

      {/* Room Header */}
      <motion.div className="glass-card p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-display font-bold flex items-center gap-2 text-white">
              <Swords className="w-5 h-5 text-neon-green" />
              {room.name}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-[10px] uppercase tracking-wider text-gray-500">
              <span className="flex items-center gap-1">
                <Music className="w-3 h-3" /> {room.bpm === "Any" ? "ANY BPM" : `${room.bpm} BPM`}
              </span>
              <span className="flex items-center gap-1 text-neon-green">
                <Clock className="w-3 h-3" /> {room.timerMinutes} MIN
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-neon-green" /> 
                {room.players.filter((p: any) => p.isReady).length}/{room.players.length} READY
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleReady}
              className={isReady ? "btn-neon text-sm" : "btn-ghost text-sm"}
            >
              {isReady ? (
                <><CheckCircle2 className="w-4 h-4" /> Ready!</>
              ) : (
                <><Circle className="w-4 h-4" /> Ready Up</>
              )}
            </button>
            {isHost && (
              <button
                onClick={handleStartBattle}
                disabled={isStarting || !allReady}
                className={`btn-neon text-sm btn-neon-purple transition-all ${
                  (!allReady || isStarting) ? "opacity-50 cursor-not-allowed grayscale" : "animate-pulse shadow-[0_0_15px_rgba(191,64,255,0.4)]"
                }`}
              >
                {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Start Battle
              </button>
            )}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Players Panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card p-5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-text-tertiary" />
              Players
              <span className="ml-auto text-xs text-text-tertiary">{room.players.length} Joined</span>
            </h3>

            <div className="space-y-1">
              {room.players.map((player: any) => (
                <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-xs font-bold border border-white/5"
                      style={{ color: RANK_COLORS[player.rank] || "#fff" }}
                    >
                      {player.username[0].toUpperCase()}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-white">{player.username}</span>
                      {player.isHost && <Crown className="w-3 h-3 text-yellow-500" />}
                      {player.id === session?.user?.id && (
                        <span className="text-[10px] text-neon-green font-bold">(you)</span>
                      )}
                    </div>
                  </div>
                  {player.isReady ? (
                    <CheckCircle2 className="w-4 h-4 text-neon-green" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-700" />
                  )}
                </div>
              ))}
            </div>

            {isHost && (
              <div className="mt-4 pt-4 border-t border-border-default">
                <h4 className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Host Controls</h4>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="flex-1 btn-ghost text-xs !py-2 !px-3"
                  >
                    <Settings className="w-3.5 h-3.5" /> Settings
                  </button>
                  <button className="flex-1 btn-ghost text-xs !py-2 !px-3 hover:!border-neon-pink hover:!text-neon-pink">
                    <UserX className="w-3.5 h-3.5" /> Kick
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Chat Panel */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="h-[500px]">
            <Chat roomId={roomId} messages={room.messages} onMessageSent={fetchRoom} />
          </div>
        </motion.div>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-bg-primary/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              className="relative w-full max-w-md glass-card p-6 shadow-2xl"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold flex items-center gap-2">
                  <Settings className="w-5 h-5 text-neon-green" />
                  Room Settings
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text-tertiary" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Room Name</label>
                  <input
                    type="text"
                    value={roomSettings.name}
                    onChange={(e) => setRoomSettings({ ...roomSettings, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">BPM</label>
                    <input
                      type="text"
                      value={roomSettings.bpm}
                      onChange={(e) => setRoomSettings({ ...roomSettings, bpm: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-text-secondary mb-1.5">Timer (min)</label>
                    <input
                      type="number"
                      value={roomSettings.timerMinutes}
                      onChange={(e) => setRoomSettings({ ...roomSettings, timerMinutes: e.target.value })}
                      className="w-full px-4 py-2 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 btn-ghost text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSettings}
                    disabled={isUpdating}
                    className="flex-2 btn-neon text-sm min-w-[120px]"
                  >
                    {isUpdating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <><Save className="w-4 h-4" /> Save Settings</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
