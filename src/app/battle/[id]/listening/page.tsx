"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Headphones, 
  Music, 
  Volume2, 
  Loader2, 
  Users, 
  ArrowRight,
  Disc,
  Mic2
} from "lucide-react";
import Chat from "@/components/Chat";

const BEAT_DURATION = 45; // seconds per beat

export default function ListeningPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const roomId = params.id as string;

  const [room, setRoom] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(-1);
  const [timeLeftInBeat, setTimeLeftInBeat] = useState(BEAT_DURATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchRoomAndSubmissions = useCallback(async () => {
    try {
      const [roomRes, subRes] = await Promise.all([
        fetch(`/api/rooms/${roomId}`),
        fetch(`/api/battles/${roomId}/submissions`)
      ]);

      if (roomRes.ok && subRes.ok) {
        const roomData = await roomRes.json();
        const subData = await subRes.json();
        
        setRoom(roomData);
        setSubmissions(subData.submissions);

        if (roomData.status === "VOTING") {
          router.push(`/battle/${roomId}/voting`);
          return;
        }

        // Calculate current beat based on time since listening started
        if (roomData.battle?.statusChangedAt) {
          const startTime = new Date(roomData.battle.statusChangedAt).getTime();
          const now = Date.now();
          const elapsedSeconds = Math.floor((now - startTime) / 1000);
          
          const index = Math.floor(elapsedSeconds / BEAT_DURATION);
          const remaining = BEAT_DURATION - (elapsedSeconds % BEAT_DURATION);

          if (index < subData.submissions.length) {
            setCurrentBeatIndex(index);
            setTimeLeftInBeat(remaining);
          } else {
            // All beats played, move to voting if host
            if (roomData.hostId === session?.user?.id && !isTransitioning) {
              setIsTransitioning(true);
              await fetch(`/api/battles/${roomId}/status`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "VOTING" })
              });
            }
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, router, session?.user?.id, isTransitioning]);

  useEffect(() => {
    fetchRoomAndSubmissions();
    const interval = setInterval(fetchRoomAndSubmissions, 3000);
    return () => clearInterval(interval);
  }, [fetchRoomAndSubmissions]);

  // Handle Audio Playback
  useEffect(() => {
    if (currentBeatIndex >= 0 && currentBeatIndex < submissions.length) {
      const beat = submissions[currentBeatIndex];
      
      if (!audioRef.current || audioRef.current.src !== beat.audioUrl) {
        if (audioRef.current) audioRef.current.pause();
        
        const audio = new Audio(beat.audioUrl);
        audio.play().catch(e => console.error("Autoplay blocked", e));
        audioRef.current = audio;
      }
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [currentBeatIndex, submissions]);

  if (isLoading || !room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
      </div>
    );
  }

  const currentBeat = submissions[currentBeatIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Listening View */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            className="glass-card p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Background Animation */}
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.1)_0%,transparent_70%)] animate-pulse" />
            </div>

            <AnimatePresence mode="wait">
              {currentBeat ? (
                <motion.div
                  key={currentBeat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative z-10"
                >
                  <div className="w-32 h-32 rounded-full bg-black/40 border-4 border-neon-green/30 flex items-center justify-center mx-auto mb-8 relative">
                    <Disc className="w-16 h-16 text-neon-green animate-spin-slow" />
                    <div className="absolute -bottom-2 -right-2 bg-neon-green text-black text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter">
                      LIVE
                    </div>
                  </div>

                  <h2 className="text-sm text-text-tertiary uppercase tracking-[0.3em] mb-2">Now Playing</h2>
                  <h1 className="text-4xl font-display font-black text-white mb-2">{currentBeat.label}</h1>
                  <div className="flex items-center justify-center gap-2 text-neon-green font-mono text-xl">
                    <Volume2 className="w-5 h-5 animate-pulse" />
                    <span>00:{timeLeftInBeat.toString().padStart(2, "0")}</span>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-neon-green animate-spin mx-auto mb-4" />
                  <p className="text-text-secondary">Waiting for beats to start...</p>
                </div>
              )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-neon-green transition-all duration-1000" style={{ width: `${(timeLeftInBeat / BEAT_DURATION) * 100}%` }} />
          </motion.div>

          {/* Player Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {submissions.map((sub, i) => (
              <div 
                key={sub.id} 
                className={`p-4 rounded-2xl border transition-all ${
                  i === currentBeatIndex 
                    ? "bg-neon-green/10 border-neon-green/30 shadow-[0_0_15px_rgba(57,255,20,0.1)]" 
                    : "bg-black/20 border-white/5 opacity-50"
                }`}
              >
                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Producer {i + 1}</div>
                <div className="text-sm font-bold text-white truncate">{sub.label}</div>
                {i === currentBeatIndex && (
                  <div className="flex gap-1 mt-2">
                    <div className="w-1 h-3 bg-neon-green animate-bounce-slow" />
                    <div className="w-1 h-3 bg-neon-green animate-bounce-fast" />
                    <div className="w-1 h-3 bg-neon-green animate-bounce-slow" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Stats & Chat */}
        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-neon-green" />
              Participants
            </h3>
            <div className="space-y-2">
              {room.players.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{p.username}</span>
                  {submissions.some(s => s.userId === p.id) ? (
                    <span className="text-[10px] bg-neon-green/10 text-neon-green px-1.5 py-0.5 rounded font-bold uppercase">Ready</span>
                  ) : (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold uppercase">No Beat</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="h-[400px]">
            <Chat roomId={roomId} messages={room.messages} onMessageSent={fetchRoomAndSubmissions} />
          </div>
        </div>

      </div>
    </div>
  );
}
