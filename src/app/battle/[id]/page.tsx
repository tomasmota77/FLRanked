"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Upload,
  Download,
  Music,
  CheckCircle2,
  AlertTriangle,
  Headphones,
  FileAudio,
  Replace,
  Swords,
  Volume2,
  Play,
  Pause,
  Timer,
  Zap,
  X,
  ArrowRight,
  Loader2,
} from "lucide-react";

// Sample types and definitions
type SampleType = "808" | "perc" | "snare" | "clap" | "vox" | "hihat" | "openhat" | "kick" | "oneshot";

interface SampleDef {
  name: string;
  type: SampleType;
  label: string;
}

const getRandomItem = <T,>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const getMultipleRandomItems = <T,>(items: T[], count: number): T[] => {
  const shuffled = [...items].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const generateBattleSamples = (pool: Record<string, any[]>): SampleDef[] => {
  const getSafeRandom = (type: string) => {
    const list = pool[type] || [];
    if (list.length === 0) {
      // Find any non-empty category to fallback to
      const nonEmptyCat = Object.values(pool).find(cat => cat.length > 0);
      if (!nonEmptyCat) return { name: "", type: type as any, label: "" };
      return getRandomItem(nonEmptyCat);
    }
    return getRandomItem(list);
  };

  return [
    { ...getSafeRandom("808"), label: "808" },
    { ...getSafeRandom("perc"), label: "Perc" },
    { ...getSafeRandom("snare"), label: "Snare" },
    { ...getSafeRandom("clap"), label: "Clap" },
    { ...getSafeRandom("vox"), label: "Vox" },
    { ...getSafeRandom("hihat"), label: "Hi-Hat" },
    { ...getSafeRandom("openhat"), label: "Open Hat" },
    { ...getSafeRandom("kick"), label: "Kick" },
    ...getMultipleRandomItems(pool["oneshot"] || [], 3).map((s, i) => ({ ...s, label: `One-Shot ${i + 1}` })),
  ];
};

const TYPE_COLORS: Record<string, string> = {
  oneshot: "text-neon-cyan",
  snare: "text-neon-orange",
  "808": "text-neon-purple",
  kick: "text-neon-green",
  perc: "text-rank-gold",
  hihat: "text-text-primary",
  clap: "text-neon-pink",
  openhat: "text-rank-platinum",
  vox: "text-red-400",
};

import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BattlePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const roomId = params.id as string;

  const [battle, setBattle] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);

  const [phase, setPhase] = useState<"countdown" | "battle" | "uploading">("countdown");
  const [countdown, setCountdown] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes
  const [uploaded, setUploaded] = useState(false);
  const [uploadFile, setUploadFile] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [battleSamples, setBattleSamples] = useState<SampleDef[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Heartbeat to keep room alive during battle
  useEffect(() => {
    if (sessionStatus !== "authenticated" || !session?.user?.id || !roomId) return;

    const heartbeatInterval = setInterval(async () => {
      try {
        await fetch(`/api/rooms/${roomId}/heartbeat`, { method: "POST" });
      } catch (err) {
        console.error("Heartbeat failed", err);
      }
    }, 10000);

    return () => clearInterval(heartbeatInterval);
  }, [sessionStatus, session?.user?.id, roomId]);

  const roomBpm: number | "Any" = "Any";

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch("/api/samples");
        if (!res.ok) {
          const errorText = await res.text();
          console.error(`Fetch samples error (${res.status}):`, errorText);
          return;
        }
        const pool = await res.json();
        setBattleSamples(generateBattleSamples(pool));
      } catch (err) {
        console.error("Error fetching samples", err);
      } finally {
        setIsLoadingSamples(false);
      }
    };
    fetchSamples();
  }, []);

  // Countdown phase
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) {
      setPhase("battle");
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, phase]);

  // Battle timer
  useEffect(() => {
    if (phase !== "battle") return;
    if (timeRemaining <= 0) {
      setPhase("uploading");
      
      // If host, trigger the transition to LISTENING after a short grace period for final uploads
      const isHost = room?.hostId === session?.user?.id;
      if (isHost) {
        setTimeout(async () => {
          await fetch(`/api/battles/${roomId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "LISTENING" })
          });
        }, 10000); // 10s grace period for last uploads
      }
      return;
    }
    const timer = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [phase, timeRemaining, room?.hostId, session?.user?.id, roomId]);

  const fetchBattleStatus = useCallback(async () => {
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
        
        if (roomData.status === "LISTENING") {
          router.push(`/battle/${roomId}/listening`);
          return;
        }

        // Automatic transition if everyone submitted
        const isHost = roomData.hostId === session?.user?.id;
        const onlinePlayers = roomData.players.filter((p: any) => p.isOnline);
        
        if (isHost && roomData.status === "IN_PROGRESS" && subData.submissions.length > 0 && subData.submissions.length >= onlinePlayers.length) {
          await fetch(`/api/battles/${roomId}/status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "LISTENING" })
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch room status", err);
    }
  }, [roomId, router, session?.user?.id]);

  useEffect(() => {
    fetchBattleStatus();
    const interval = setInterval(fetchBattleStatus, 3000);
    return () => clearInterval(interval);
  }, [fetchBattleStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadBeat(file);
    }
  };

  const uploadBeat = async (file: File) => {
    if (!session?.user?.id) return;
    
    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp3"];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a valid audio file (.mp3 or .wav)");
      return;
    }

    // Validate size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert("File too large. Max 50MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("battleId", roomId);
    formData.append("userId", session.user.id);

    try {
      // 1. Upload file to server
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const uploadData = await uploadRes.json();

      // 2. Register submission in DB
      const submitRes = await fetch(`/api/battles/${roomId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: uploadData.url,
          fileName: uploadData.fileName,
        }),
      });

      if (!submitRes.ok) {
        const errorData = await submitRes.json();
        throw new Error(errorData.details || "Submission failed");
      }

      setUploaded(true);
      setUploadFile(file.name);
      fetchBattleStatus(); // Update count immediately
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload beat. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const isUrgent = timeRemaining <= 60;

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const playPreview = (fileName: string) => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    // Samples are in /samples/category/file.wav
    const audioPath = `/samples/${fileName}`;
    const audio = new Audio(audioPath);
    audio.volume = 0.5;
    audio.play().catch(() => {}); // Ignore play errors (e.g. if user hasn't interacted)
    previewAudioRef.current = audio;
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      {/* ═══════ COUNTDOWN OVERLAY ═══════ */}
      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center">
              <motion.div
                className="text-lg text-text-secondary mb-4 uppercase tracking-[0.3em]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Battle Starting
              </motion.div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={countdown}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="text-[12rem] font-display font-black neon-text-green leading-none"
                  style={{
                    textShadow: "0 0 40px rgba(57,255,20,0.5), 0 0 80px rgba(57,255,20,0.3), 0 0 120px rgba(57,255,20,0.1)",
                  }}
                >
                  {countdown || "GO!"}
                </motion.div>
              </AnimatePresence>

              <motion.div
                className="mt-6 text-text-tertiary text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Get your DAW ready • {roomBpm === "Any" ? "ANY BPM" : `${roomBpm} BPM`} • Random Samples
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════ BATTLE UI ═══════ */}
      {phase !== "countdown" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Timer Header */}
          <motion.div
            className={`bg-[#0a0a0f] border border-white/5 p-4 mb-6 text-center relative overflow-hidden rounded-2xl ${
              isUrgent ? "border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)]" : ""
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-8">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Time Left</div>
                  <div className={`text-4xl font-mono font-black ${isUrgent ? "text-red-500 animate-pulse" : "text-neon-green"}`}>
                    {formatTime(timeRemaining)}
                  </div>
                </div>
                <div className="h-10 w-px bg-white/5" />
                <div className="flex flex-col items-start gap-1">
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">Settings</div>
                  <div className="flex gap-3 text-xs font-bold text-white">
                    <span>{roomBpm === "Any" ? "ANY BPM" : `${roomBpm} BPM`}</span>
                    <span className="text-gray-600">•</span>
                    <span>RANDOM</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ═══════ SAMPLE PACK PANEL ═══════ */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold flex items-center gap-2">
                    <Headphones className="w-5 h-5 text-neon-green" />
                    Sample Pack
                  </h3>
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                    <Volume2 className="w-3 h-3 text-neon-green" />
                    <span className="text-[10px] font-bold text-gray-400">Hover to Preview</span>
                  </div>
                </div>
                <p className="text-xs text-text-tertiary mb-4">Random Sample Pool</p>

                <div className="space-y-1">
                  {isLoadingSamples ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin text-neon-green" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Scanning folders...</span>
                    </div>
                  ) : (
                    battleSamples.map((file, i) => (
                      <motion.div
                        key={`${file.name}-${i}`}
                        className="flex items-center justify-between p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors group cursor-pointer border border-white/[0.02]"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05 }}
                        onMouseEnter={() => playPreview(file.name)}
                        onMouseLeave={stopPreview}
                      >
                        <div className="flex items-center gap-3">
                          <FileAudio className={`w-4 h-4 ${TYPE_COLORS[file.type] || "text-gray-500"}`} />
                          <div>
                            <div className="text-xs font-bold text-white">{file.label}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <a 
                            href={`/samples/${encodeURIComponent(file.name).replace(/%2F/g, '/')}`}
                            download={file.name.split('/').pop()}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 text-gray-500 hover:text-neon-green transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Download All */}
                <button 
                  onClick={() => {
                    if (!battleSamples.length) return;
                    // Trigger downloads with a slight delay to avoid browser blocking
                    battleSamples.forEach((file, index) => {
                      setTimeout(() => {
                        const link = document.createElement('a');
                        link.href = `/samples/${encodeURIComponent(file.name).replace(/%2F/g, '/')}`;
                        link.download = file.name.split('/').pop() || 'sample.wav';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, index * 300);
                    });
                  }}
                  className="btn-ghost w-full mt-4 text-sm !py-2.5"
                >
                  <Download className="w-4 h-4" />
                  Download All Samples
                </button>
              </div>
            </motion.div>

            {/* ═══════ UPLOAD PANEL ═══════ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card p-5">
                <h3 className="font-bold mb-1 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-neon-purple" />
                  Upload Your Beat
                </h3>
                <p className="text-xs text-text-tertiary mb-4">Accepted formats: .mp3, .wav</p>

                {/* Upload Zone */}
                {!uploaded ? (
                  <div
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                      dragOver
                        ? "border-neon-green bg-neon-green/5"
                        : "border-border-default hover:border-border-hover hover:bg-white/[0.02]"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { 
                      e.preventDefault(); 
                      setDragOver(false); 
                      const file = e.dataTransfer.files?.[0];
                      if (file) uploadBeat(file);
                    }}
                    onClick={handleUploadClick}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".mp3,.wav"
                      onChange={handleFileSelect}
                    />
                    {isUploading ? (
                      <div className="py-4">
                        <Loader2 className="w-12 h-12 text-neon-purple mx-auto mb-4 animate-spin" />
                        <p className="text-sm font-medium mb-1">Uploading Beat...</p>
                        <p className="text-xs text-text-tertiary">Don't close this page</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-text-tertiary mx-auto mb-4" />
                        <p className="text-sm font-medium mb-1">
                          Drag & drop your beat here
                        </p>
                        <p className="text-xs text-text-tertiary">
                          or click to browse files
                        </p>
                      </>
                    )}
                    <p className="text-xs text-text-tertiary mt-2">
                      Max 50MB • .mp3 or .wav
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Uploaded File */}
                    <div className="p-4 rounded-xl bg-neon-green/5 border border-neon-green/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-neon-green" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-neon-green">Upload Successful!</div>
                            <div className="text-xs text-text-tertiary">{uploadFile}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => { setUploaded(false); setUploadFile(null); }}
                          className="p-1.5 rounded-lg hover:bg-bg-card transition-colors"
                        >
                          <X className="w-4 h-4 text-text-tertiary" />
                        </button>
                      </div>
                    </div>

                    {/* Replace Upload */}
                    <button
                      onClick={() => { setUploaded(false); setUploadFile(null); }}
                      className="btn-ghost w-full text-sm !py-2.5"
                    >
                      <Replace className="w-4 h-4" />
                      Replace Upload
                    </button>
                  </div>
                )}

                {/* Submit */}
                <div className="mt-6 pt-4 border-t border-border-default">
                  {uploaded ? (
                    (() => {
                      const isHost = room?.hostId === session?.user?.id;
                      const onlinePlayers = room?.players?.filter((p: any) => p.isOnline) || [];
                      const allSubmitted = submissions.length >= onlinePlayers.length && onlinePlayers.length > 0;

                      if (isHost && allSubmitted) {
                        return (
                          <button
                            onClick={async () => {
                              await fetch(`/api/battles/${roomId}/status`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: "LISTENING" })
                              });
                            }}
                            className="btn-neon w-full btn-neon-purple text-sm animate-pulse shadow-[0_0_20px_rgba(191,64,255,0.4)]"
                          >
                            <Play className="w-4 h-4" />
                            All Ready! Advance to Listening
                          </button>
                        );
                      }

                      return (
                        <div
                          className="btn-neon w-full btn-neon-purple text-sm opacity-80 cursor-default"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Beat Submitted — Waiting for Others ({submissions.length}/{onlinePlayers.length})
                        </div>
                      );
                    })()
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-text-tertiary">
                      <AlertTriangle className="w-4 h-4 text-neon-orange" />
                      Upload your beat before time runs out!
                    </div>
                  )}
                </div>

                {/* Anti-Cheat Notice */}
                <div className="mt-4 p-3 rounded-xl bg-bg-tertiary/50 border border-border-default">
                  <div className="flex items-center gap-2 text-xs text-text-tertiary">
                    <Zap className="w-3.5 h-3.5 text-neon-green flex-shrink-0" />
                    <span>Anti-cheat active: Uploads locked after timer expires. One submission per battle.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
