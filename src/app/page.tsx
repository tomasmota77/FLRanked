"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Swords,
  Play,
  DoorOpen,
  Crown,
  Music,
  Mic2,
  Users,
  Headphones,
  Zap,
} from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

import { useState, useEffect } from "react";

export default function LandingPage() {
  const [stats, setStats] = useState({
    liveBattles: 0,
    producersOnline: 0,
    activeProducers: 0,
    battlesToday: 0,
    beatsCreated: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  return (
    <div className="relative">
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden">
        {/* Deep atmosphere gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-neon-green/10 blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-purple/10 blur-[150px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.03)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            className="text-center"
            initial="initial"
            animate="animate"
            variants={stagger}
          >
            {/* Live Badge */}
            <motion.div 
              variants={fadeUp} 
              className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 mb-10 hover:border-neon-green/30 transition-colors cursor-default"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-green" />
              </span>
              <span className="text-neon-green text-xs font-bold tracking-[0.1em] uppercase">
                {stats.liveBattles} Live Battles • {stats.producersOnline} Producers Online
              </span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              variants={fadeUp}
              className="text-6xl sm:text-8xl lg:text-9xl font-display font-black tracking-tighter mb-8 leading-[0.9] select-none"
            >
              <span className="text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">BATTLE PRODUCERS</span>
              <br />
              <span className="text-neon-green text-glow-green">WORLDWIDE</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-2xl text-text-secondary max-w-3xl mx-auto mb-14 leading-relaxed font-medium"
            >
              The ultimate real-time beat battle platform. 
              Same samples. Same time limit. Only your{" "}
              <span className="text-neon-green font-bold border-b-2 border-neon-green/20">skill</span> decides the winner.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/rooms" className="btn-neon text-lg !px-12 !py-5 shadow-[0_0_40px_rgba(57,255,20,0.25)] hover:scale-105 transition-transform">
                <Swords className="w-6 h-6" />
                START BATTLE
              </Link>
              <Link href="/rooms" className="btn-ghost text-lg !px-12 !py-5 border-white/10 hover:bg-white/5 hover:border-white/20 backdrop-blur-sm">
                <DoorOpen className="w-6 h-6" />
                BROWSE ROOMS
              </Link>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={fadeUp} className="mt-24 flex flex-wrap justify-center gap-16 max-w-5xl mx-auto border-t border-white/5 pt-16">
              {[
                { label: "Active Producers", value: formatNumber(stats.activeProducers), icon: Users },
                { label: "Battles Today", value: formatNumber(stats.battlesToday), icon: Swords },
                { label: "Beats Created", value: formatNumber(stats.beatsCreated), icon: Headphones },
              ].map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="text-4xl sm:text-5xl font-display font-black text-white mb-2 group-hover:text-neon-green transition-all duration-500 group-hover:scale-110">
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.3em] font-black">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-32 relative bg-[#050505]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-6">
              How It <span className="neon-text-green">Works</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto text-lg">
              Four simple steps to prove you&apos;re the best producer in the arena.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Join Room", desc: "Pick your skill level and enter a live battle room.", icon: DoorOpen, color: "text-green-500" },
              { step: "02", title: "Get Samples", desc: "Download the same sample pack as everyone else.", icon: Music, color: "text-purple-500" },
              { step: "03", title: "Make Beat", desc: "You have 10 minutes to cook up your best track.", icon: Mic2, color: "text-cyan-500" },
              { step: "04", title: "Win & Rank", desc: "Vote on tracks anonymously and climb the leaderboard.", icon: Crown, color: "text-yellow-500" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                className="bg-[#0A0A0A] border border-white/5 p-8 rounded-2xl relative group hover:border-neon-green/30 transition-all duration-500"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-5xl font-display font-black text-white/[0.03] absolute top-6 right-6 group-hover:text-neon-green/10 transition-colors">
                  {item.step}
                </div>
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-lg font-bold mb-3 text-white tracking-tight">{item.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA SECTION ═══════ */}
      <section className="py-32 relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-neon-green/5 blur-[150px] translate-y-1/2" />
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex justify-center w-full"
          >
            <div className="glass-card p-16 sm:p-20 border border-white/10 relative overflow-hidden rounded-[2.5rem] w-full text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-green/[0.07] via-transparent to-neon-purple/[0.07]" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-neon-green/10 flex items-center justify-center mx-auto mb-10">
                  <Zap className="w-10 h-10 text-neon-green" />
                </div>
                <h2 className="text-4xl sm:text-5xl font-display font-black mb-6 leading-tight">
                  Ready to <span className="neon-text-green text-glow-green">Prove Yourself</span>?
                </h2>
                <p className="text-lg text-text-secondary max-w-xl mx-auto mb-12 leading-relaxed">
                  Join thousands of producers battling every day. Your next beat could be the one that changes everything.
                </p>
                <Link href="/rooms" className="btn-neon text-lg !px-12 !py-5 shadow-[0_0_30px_rgba(57,255,20,0.3)]">
                  <Play className="w-6 h-6" />
                  ENTER THE ARENA
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
