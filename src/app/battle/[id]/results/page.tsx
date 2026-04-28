"use client";

import Link from "next/link";
import Chat from "@/components/Chat";

export default function ResultsPage() {
  const params = useParams();
  const roomId = params.id as string;
  
  const [results, setResults] = useState<Result[]>([]);
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [resultsRes, roomRes] = await Promise.all([
        fetch(`/api/battles/${roomId}/results`),
        fetch(`/api/rooms/${roomId}`)
      ]);

      if (resultsRes.ok && roomRes.ok) {
        const resultsData = await resultsRes.json();
        const roomData = await roomRes.json();
        setResults(resultsData.results);
        setRoom(roomData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setTimeout(() => setShowResults(true), 500);
    }
  }, [roomId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    
    const confettiTimer = setTimeout(() => setShowConfetti(false), 5000);
    return () => {
      clearInterval(interval);
      clearTimeout(confettiTimer);
    };
  }, [fetchData]);

  if (isLoading || !room) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-neon-purple" />
        <p className="text-text-secondary font-medium">Calculating Results...</p>
      </div>
    );
  }

  const winner = results[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Winner Announcement */}
          {winner && (
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rank-gold/10 border border-rank-gold/20 mb-6">
                  <Trophy className="w-4 h-4 text-rank-gold" />
                  <span className="text-sm font-medium text-rank-gold">Battle Complete</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              >
                <div className="text-6xl mb-4">👑</div>
                <h1 className="text-4xl sm:text-5xl font-display font-black mb-2">
                  <span style={{ color: RANK_COLORS[winner.rank] || "#FFF" }}>{winner.username}</span>
                </h1>
                <p className="text-xl text-text-secondary">
                  Wins the battle with <span className="text-rank-gold font-bold">{winner.votes} votes</span>!
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Podium */}
          <AnimatePresence>
            {showResults && (
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="space-y-3">
                  {results.map((result, i) => {
                    const style = POSITION_STYLES[Math.min(i, 3)];

                    return (
                      <motion.div
                        key={result.username}
                        className={`glass-card p-4 border ${style.border} relative overflow-hidden ${
                          result.isYou ? "ring-1 ring-neon-green/30" : ""
                        }`}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + i * 0.15 }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-r ${style.bg}`} />
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Position */}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.color}`}>
                              {i === 0 ? (
                                <Crown className="w-6 h-6" />
                              ) : (
                                <span className="text-xl font-display font-black">#{result.position}</span>
                              )}
                            </div>

                            {/* Avatar */}
                            <div
                              className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-purple to-neon-green flex items-center justify-center font-bold shadow-lg"
                              style={{ border: `2px solid ${RANK_COLORS[result.rank]}40` }}
                            >
                              {result.username[0]}
                            </div>

                            {/* Info */}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold">{result.username}</span>
                                {result.isYou && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-xs" style={{ color: RANK_COLORS[result.rank] }}>
                                {result.rank} • {result.newElo} ELO
                              </div>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="flex items-center gap-1 text-sm">
                                <ThumbsUp className="w-3.5 h-3.5 text-text-tertiary" />
                                <span className="font-bold">{result.votes}</span>
                              </div>
                              <div className="text-xs text-text-tertiary">votes</div>
                            </div>

                            <div className="text-right">
                              <div className={`flex items-center gap-1 text-sm font-bold font-mono ${
                                result.eloChange >= 0 ? "text-neon-green" : "text-neon-pink"
                              }`}>
                                {result.eloChange >= 0 ? (
                                  <TrendingUp className="w-3.5 h-3.5" />
                                ) : (
                                  <TrendingDown className="w-3.5 h-3.5" />
                                )}
                                {result.eloChange > 0 ? "+" : ""}{result.eloChange}
                              </div>
                              <div className="text-xs text-text-tertiary">ELO</div>
                            </div>

                            {/* Download Beat (ONLY OWN BEAT in results if you want, or all as prize? User said "nao quero que dê pra fazer download do beat dos outros". I'll restrict it to ONLY YOU can download your own beat) */}
                            {result.isYou && (
                              <a
                                href={result.audioUrl}
                                download={`${result.username}_beat.wav`}
                                className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-neon-green/30 transition-all group"
                                title="Download Your Beat"
                              >
                                <Download className="w-4 h-4 text-text-tertiary group-hover:text-neon-green" />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <Link href="/rooms" className="btn-neon">
              <Swords className="w-4 h-4" />
              Battle Again
            </Link>
            <Link href="/dashboard" className="btn-ghost">
              <ArrowRight className="w-4 h-4" />
              Back to Dashboard
            </Link>
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
