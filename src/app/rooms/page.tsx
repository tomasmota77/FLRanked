"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DoorOpen,
  Users,
  Clock,
  Swords,
  Plus,
  Search,
  Filter,
  Lock,
  Crown,
  Zap,
  Music,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const FILTERS = ["All", "Beginner", "Intermediate", "Pro"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  WAITING: { label: "Waiting", color: "text-orange-500", bg: "bg-orange-500/5" },
  IN_PROGRESS: { label: "In Battle", color: "text-green-500", bg: "bg-green-500/5" },
  VOTING: { label: "Voting", color: "text-purple-500", bg: "bg-purple-500/5" },
  FINISHED: { label: "Finished", color: "text-gray-500", bg: "bg-gray-500/5" },
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [isAnyBpm, setIsAnyBpm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState("4 Players");
  const [bpm, setBpm] = useState("140");
  const [timer, setTimer] = useState("10");

  const router = useRouter();

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/rooms");
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Fetch rooms error (${res.status}):`, errorText);
        setRooms([]);
        return;
      }
      const data = await res.json();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async () => {
    setIsCreating(true);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName,
          type: roomType,
          bpm: !isAnyBpm ? bpm : "Any",
          timerMinutes: timer,
        }),
      });
      
      if (res.ok) {
        const data = await res.json();
        router.push(`/rooms/${data.id}`);
      } else {
        const errorText = await res.text();
        console.error(`Create room error (${res.status}):`, errorText);
        try {
          const data = JSON.parse(errorText);
          alert(data.error + (data.details ? `: ${data.details}` : "") || "Error creating room");
        } catch (e) {
          alert("Error creating room. See console for details.");
        }
      }
    } catch (err) {
      alert("Error creating room");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredRooms = rooms.filter((room) => {
    if (search && !room.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter !== "All" && room.difficulty !== activeFilter) return false;
    return true;
  });

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
            <DoorOpen className="w-8 h-8 text-neon-green" />
            Battle Rooms
          </h1>
          <p className="text-text-secondary">
            Join a room or create your own battle arena
          </p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-neon text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Room
        </button>
      </motion.div>

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <div className="glass-card p-6">
              <h3 className="text-lg font-bold mb-4">Create New Room</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Room Name</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="My Battle Room"
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Type</label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default text-sm appearance-none cursor-pointer"
                  >
                    <option>1v1</option>
                    <option>4 Players</option>
                    <option>8 Players</option>
                    <option>16 Players</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5 flex items-center justify-between">
                    <span>BPM</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAnyBpm}
                        onChange={(e) => setIsAnyBpm(e.target.checked)}
                        className="w-3.5 h-3.5 accent-neon-green bg-bg-tertiary border-border-default"
                      />
                      <span className="text-[10px] uppercase font-bold text-gray-400">Any BPM</span>
                    </label>
                  </label>
                  {!isAnyBpm ? (
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm"
                    />
                  ) : (
                    <div className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary/50 border border-border-default text-sm text-gray-500 cursor-not-allowed text-center">
                      Any BPM
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Timer (min)</label>
                  <input
                    type="number"
                    value={timer}
                    onChange={(e) => setTimer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                  className="btn-neon text-sm !py-2.5"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Create & Start
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="btn-ghost text-sm !py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search & Filters */}
      <motion.div
        className="flex flex-col sm:flex-row gap-4 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg-card border border-border-default focus:border-neon-green/50 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeFilter === filter
                ? "bg-neon-green/10 text-neon-green border border-neon-green/30"
                : "bg-bg-card border border-border-default text-text-secondary hover:text-text-primary hover:border-border-hover"
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
            <span className="text-sm font-bold uppercase tracking-widest">Fetching Rooms...</span>
          </div>
        ) : (
          filteredRooms.map((room, i) => {
            const status = STATUS_CONFIG[room.status] || STATUS_CONFIG.WAITING;
            const isFull = room.currentPlayers >= room.maxPlayers;
            const canJoin = room.status === "WAITING" && !isFull;

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="bg-[#1a1a25] border border-white/5 hover:border-neon-green/30 rounded-xl p-4 transition-all flex items-center justify-between">
                  <Link href={`/rooms/${room.id}`} className="flex flex-col gap-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-bold text-white">
                      {room.name}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${room.difficulty === "Pro"
                        ? "bg-pink-500/10 text-pink-500"
                        : room.difficulty === "Intermediate"
                          ? "bg-purple-500/10 text-purple-500"
                          : "bg-green-500/10 text-green-500"
                        }`}>
                        {room.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" /> {room.currentPlayers}/{room.maxPlayers}
                      </span>
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" /> {room.bpm === "Any" ? "Any BPM" : `${room.bpm} BPM`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-yellow-500" /> {room.host}
                      </span>
                    </div>
                  </Link>
                  <div className="flex flex-col items-end justify-between gap-3 ml-4 flex-shrink-0">
                    <div className={`text-xs font-bold px-2 py-1 rounded-md ${status.bg} border border-white/5 ${status.color}`}>
                      {status.label} {room.timeLeft ? `(${room.timeLeft})` : ""}
                    </div>
                    {canJoin && (
                      <Link
                        href={`/rooms/${room.id}`}
                        className="bg-neon-green text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all hover:bg-neon-green/90"
                      >
                        Join
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {!isLoading && filteredRooms.length === 0 && (
        <div className="text-center py-16">
          <DoorOpen className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">No rooms found</h3>
          <p className="text-text-secondary text-sm">Try adjusting your filters or create a new room</p>
        </div>
      )}
    </div>
  );
}
