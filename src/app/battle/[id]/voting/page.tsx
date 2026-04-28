"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Vote,
  Play,
  Pause,
  Volume2,
  Clock,
  CheckCircle2,
  ThumbsUp,
  ArrowRight,
  Lock,
  Download,
  Loader2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Chat from "@/components/Chat";

interface Submission {
  id: string;
  label: string;
  audioUrl: string;
  userId: string;
  color: string;
  duration?: string;
}

export default function VotingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const roomId = params.id as string;

  const [room, setRoom] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [votedFor, setVotedFor] = useState<string | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [voteTimeLeft, setVoteTimeLeft] = useState(120); // 2 minutes
  const [progress, setProgress] = useState<Record<string, number>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchData = useCallback(async () => {
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

        if (roomData.status === "FINISHED") {
          router.push(`/battle/${roomId}/results`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, router]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Voting timer
  useEffect(() => {
    if (voteTimeLeft <= 0) return;
    const timer = setInterval(() => setVoteTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [voteTimeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVote = async (submissionId: string) => {
    if (votedFor || !session?.user?.id) return;

    try {
      const res = await fetch(`/api/battles/${roomId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to vote");
        return;
      }

      setVotedFor(submissionId);
    } catch (err) {
      console.error(err);
      alert("Error submitting vote");
    }
  };

  const togglePlay = (submission: Submission) => {
    if (playing === submission.id) {
      audioRef.current?.pause();
      setPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audio = new Audio(submission.audioUrl);
      audio.play().catch(e => console.error("Playback error", e));
      
      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(prev => ({
            ...prev,
            [submission.id]: (audio.currentTime / audio.duration) * 100
          }));
        }
      };
      
      audio.onended = () => {
        setPlaying(null);
        setProgress(prev => ({ ...prev, [submission.id]: 0 }));
      };
      
      audioRef.current = audio;
      setPlaying(submission.id);
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const generateWaveform = (count: number, seed: string) =>
    Array.from({ length: count }, (_, i) => {
      const pseudoRandom = Math.abs(Math.sin(i * seed.charCodeAt(0))) * 100;
      return pseudoRandom;
    });

  if (isLoading || !room) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-neon-purple" />
        <p className="text-text-secondary font-medium">Loading Submissions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Voting List */}
        <div className="lg:col-span-2">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-purple/10 border border-neon-purple/20 mb-4">
              <Vote className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-medium text-neon-purple">Voting Phase</span>
            </div>
            <h1 className="text-3xl font-display font-bold mb-2">
              Choose the Best <span className="neon-text-purple">Beat</span>
            </h1>
            <p className="text-text-secondary text-sm max-w-md mx-auto">
              Vote for your favorite producer. You cannot vote for your own submission.
            </p>
          </motion.div>

          {/* Timer */}
          <motion.div
            className="glass-card p-4 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-center gap-3">
              <Clock className="w-5 h-5 text-neon-purple" />
              <span className="text-sm text-text-secondary">Voting ends in</span>
              <span className="text-2xl font-mono font-bold neon-text-purple">
                {formatTime(voteTimeLeft)}
              </span>
            </div>
          </motion.div>

          {/* Beats */}
          <div className="space-y-4">
            {submissions.map((beat, i) => {
              const isPlaying = playing === beat.id;
              const isVoted = votedFor === beat.id;
              const hasVoted = votedFor !== null;
              const isOwnBeat = beat.userId === session?.user?.id;
              const beatProgress = progress[beat.id] || 0;
              const waveform = generateWaveform(60, beat.id);

              return (
                <motion.div
                  key={beat.id}
                  className={`glass-card p-5 transition-all duration-300 ${
                    isVoted
                      ? "neon-glow-purple border border-neon-purple/30"
                      : hasVoted
                      ? "opacity-60"
                      : "glass-card-hover card-gradient-border"
                  } ${isOwnBeat ? "border-white/10" : ""}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {/* Play Button */}
                    <button
                      onClick={() => togglePlay(beat)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                      style={{
                        background: `${beat.color}15`,
                        border: `1px solid ${beat.color}30`,
                      }}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" style={{ color: beat.color }} />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" style={{ color: beat.color }} />
                      )}
                    </button>

                    {/* Download Button (Only for own beat) */}
                    {isOwnBeat && (
                      <a
                        href={beat.audioUrl}
                        download={`${beat.label}.wav`}
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 hover:scale-110"
                        style={{
                          background: `${beat.color}10`,
                          border: `1px solid ${beat.color}20`,
                        }}
                        title="Download Your Beat"
                      >
                        <Download className="w-4 h-4" style={{ color: beat.color }} />
                      </a>
                    )}

                    {/* Beat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold" style={{ color: beat.color }}>
                          {beat.label}
                        </span>
                        {isOwnBeat && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-tertiary border border-white/5">
                            Your Submission
                          </span>
                        )}
                        {isVoted && (
                          <span className="flex items-center gap-1 text-xs font-medium text-neon-purple">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Your Vote
                          </span>
                        )}
                      </div>

                      {/* Waveform */}
                      <div className="flex items-center gap-[2px] h-8">
                        {waveform.map((height, j) => (
                          <div
                            key={j}
                            className="flex-1 rounded-sm transition-colors duration-75"
                            style={{
                              height: `${Math.max(15, height)}%`,
                              backgroundColor:
                                isPlaying && (j / waveform.length) * 100 <= beatProgress
                                  ? beat.color
                                  : `${beat.color}20`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Vote Button */}
                    <div className="flex-shrink-0">
                      {isOwnBeat ? (
                        <div className="px-4 py-2.5 rounded-xl bg-bg-tertiary/30 text-text-tertiary text-xs italic">
                          Cannot vote for self
                        </div>
                      ) : !hasVoted ? (
                        <button
                          onClick={() => handleVote(beat.id)}
                          className="btn-ghost text-sm !py-2.5 !px-5 hover:!border-neon-purple hover:!text-neon-purple hover:!bg-neon-purple/5"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Vote
                        </button>
                      ) : isVoted ? (
                        <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-neon-purple/10 text-neon-purple text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" />
                          Voted
                        </div>
                      ) : (
                        <div className="px-4 py-2.5 rounded-xl bg-bg-tertiary/50 text-text-tertiary text-sm">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {isPlaying && (
                    <div className="h-1 rounded-full bg-bg-tertiary overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-100"
                        style={{
                          width: `${beatProgress}%`,
                          backgroundColor: beat.color,
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Bottom Action */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            {votedFor ? (
              <Link href={`/battle/${roomId}/results`} className="btn-neon btn-neon-purple">
                <ArrowRight className="w-4 h-4" />
                View Results
              </Link>
            ) : (
              <p className="text-sm text-text-tertiary">
                Listen to all beats and cast your vote before time runs out
              </p>
            )}
          </motion.div>
        </div>

        {/* Sidebar: Chat */}
        <div className="h-[calc(100vh-200px)] lg:sticky lg:top-24">
          <Chat roomId={roomId} messages={room.messages} onMessageSent={fetchData} />
        </div>

      </div>
    </div>
  );
}
