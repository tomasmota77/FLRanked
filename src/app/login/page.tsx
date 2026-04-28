"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, User, Lock, Mail, Zap, ArrowRight, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const result = await signIn("credentials", {
          email, // using email field as username/email
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid credentials. Please try again.");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Register
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, username, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to create account.");
        } else {
          // Success! Now login automatically
          const loginResult = await signIn("credentials", {
            email,
            password,
            redirect: false,
          });

          if (loginResult?.error) {
            setError("Account created, but automatic login failed. Please sign in manually.");
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-xl bg-neon-green flex items-center justify-center shadow-lg">
              <Swords className="w-6 h-6 text-black" />
            </div>
          </Link>
          <h1 className="text-3xl font-display font-bold mb-2 text-white">
            <span className="text-neon-green">FLRanked</span> Portal
          </h1>
          <p className="text-gray-400 text-sm">
            {isLogin ? "Sign in to access your hub" : "Create your producer account"}
          </p>
        </div>

        <div className="bg-[#1a1a25] rounded-2xl border border-white/5 p-6 md:p-8 relative overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-black/40 p-1 rounded-xl mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${isLogin ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!isLogin ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-2 px-3 rounded-lg font-medium"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-neon-green/50 outline-none text-white text-sm transition-all"
                  required
                />
              </div>
            </div>

            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-1.5"
              >
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ProducerName"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-neon-green/50 outline-none text-white text-sm transition-all"
                    required={!isLogin}
                  />
                </div>
              </motion.div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 focus:border-neon-green/50 outline-none text-white text-sm transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 mt-2 rounded-xl font-bold bg-neon-green text-black hover:bg-neon-green/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-neon-green/20"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  {isLogin ? "Sign In" : "Create Account"}
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(false)}
                className="text-xs text-gray-500 hover:text-white transition-colors"
              >
                Don't have an account? <span className="text-neon-green font-bold">Register here</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
