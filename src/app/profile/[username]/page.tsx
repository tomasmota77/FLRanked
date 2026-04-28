"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  Trophy,
  Swords,
  Target,
  BarChart3,
  Clock,
  Award,
  ArrowLeft,
  Calendar,
  Loader2,
  Edit3,
  Camera,
  Save,
  X,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

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

interface ProfileData {
  id: string;
  username: string;
  bio: string | null;
  image: string | null;
  elo: number;
  xp: number;
  wins: number;
  losses: number;
  streak: number;
  bestStreak: number;
  rank: string;
  level: number;
  totalBattles: number;
  joinedAt: string;
}

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const usernameParam = params.username as string;
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);

  const isOwner = session?.user && (profile?.id === (session.user as any).id);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/user/${usernameParam}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      const data = await res.json();
      setProfile(data);
      setEditForm({
        username: data.username,
        bio: data.bio || "",
        image: data.image || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [usernameParam]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", (session?.user as any)?.id);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setEditForm((prev) => ({ ...prev, image: data.url }));
        toast.success("Image uploaded!");
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      
      if (res.ok) {
        toast.success("Profile updated!");
        setIsEditing(false);
        if (editForm.username !== usernameParam) {
          router.push(`/profile/${editForm.username}`);
        } else {
          fetchProfile();
        }
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neon-green" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">User not found</h2>
        <Link href="/leaderboard" className="btn-neon text-sm">Back to Leaderboard</Link>
      </div>
    );
  }

  const rankColor = RANK_COLORS[profile.rank] || "#C0C0C0";
  const rankIcon = RANK_ICONS[profile.rank] || "🥉";
  const winRate = profile.totalBattles > 0
    ? Math.round((profile.wins / profile.totalBattles) * 100)
    : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Leaderboard
        </Link>
        
        {isOwner && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-border-default hover:border-neon-green/50 transition-all text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-8 mb-6"
          >
            <div className="flex flex-col sm:flex-row gap-8">
              {/* Image Edit */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden bg-bg-tertiary border-2 border-border-default group-hover:border-neon-green transition-colors">
                    {editForm.image ? (
                      <img src={editForm.image} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-tertiary">
                        <UserIcon className="w-12 h-12" />
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-neon-green" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-neon-green text-black cursor-pointer shadow-lg hover:scale-110 transition-transform">
                    <Camera className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <p className="text-[10px] uppercase font-bold text-text-tertiary">Profile Picture</p>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    placeholder="Tell the community about your production style..."
                    className="w-full px-4 py-2.5 rounded-xl bg-bg-tertiary border border-border-default focus:border-neon-green/50 outline-none text-sm transition-all resize-none"
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || uploading}
                    className="btn-neon text-sm !py-2.5 flex-1 sm:flex-none"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="btn-ghost text-sm !py-2.5 flex-1 sm:flex-none"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/5 via-transparent to-neon-green/5" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar */}
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-neon-purple to-neon-green flex items-center justify-center shadow-xl flex-shrink-0"
                style={{ border: `3px solid ${rankColor}`, boxShadow: `0 0 30px ${rankColor}30` }}
              >
                {profile.image ? (
                  <img src={profile.image} alt={profile.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-white">{profile.username[0].toUpperCase()}</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-display font-bold">{profile.username}</h1>
                  <span
                    className="px-3 py-1 rounded-full text-sm font-bold"
                    style={{ backgroundColor: `${rankColor}15`, color: rankColor, border: `1px solid ${rankColor}30` }}
                  >
                    {rankIcon} {profile.rank}
                  </span>
                </div>
                <p className="text-text-secondary text-sm mb-4">
                  {profile.bio || "No bio yet."}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-text-tertiary">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> Joined {profile.joinedAt}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Swords className="w-4 h-4" /> {profile.totalBattles} battles
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Level {profile.level}
                  </span>
                </div>
              </div>

              {/* ELO */}
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">ELO Rating</div>
                <div className="text-4xl font-display font-black" style={{ color: rankColor }}>
                  {profile.elo}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {[
          { label: "Wins", value: profile.wins, icon: Trophy, color: "text-green-500" },
          { label: "Losses", value: profile.losses, icon: Target, color: "text-pink-500" },
          { label: "Win Rate", value: `${winRate}%`, icon: BarChart3, color: "text-cyan-500" },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#1a1a25] border border-white/5 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">{stat.label}</span>
              <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
            </div>
            <div className="text-xl font-display font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Match History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="glass-card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-text-tertiary" />
            Match History
          </h3>
          {profile.totalBattles === 0 ? (
            <div className="text-center py-8">
              <Swords className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
              <p className="text-sm text-text-secondary">No battles yet.</p>
            </div>
          ) : (
            <div className="text-center py-4 text-sm text-text-tertiary">
              Detailed match history coming soon.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
