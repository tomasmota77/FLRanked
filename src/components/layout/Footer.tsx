import Link from "next/link";
import { Swords, Music, Code2, Play, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050505] pt-20 pb-10 overflow-hidden">
      {/* Decorative light effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-neon-green/20 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[100px] bg-neon-green/5 blur-[100px] -translate-y-1/2" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
                <Swords className="w-5 h-5 text-neon-green" />
              </div>
              <span className="text-xl font-display font-black tracking-tighter text-white">
                FL<span className="text-neon-green">RANKED</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              The ultimate real-time beat battle platform. Same samples, same time, pure skill.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-neon-green/10 hover:text-neon-green transition-all" title="Twitter">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-neon-green/10 hover:text-neon-green transition-all" title="GitHub">
                <Code2 className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-neon-green/10 hover:text-neon-green transition-all" title="YouTube">
                <Play className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[10px]">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/rooms" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Battle Rooms</Link></li>
              <li><Link href="/leaderboard" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Leaderboard</Link></li>
              <li><Link href="/dashboard" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Producer Dashboard</Link></li>
              <li><Link href="/pro" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Pro Membership</Link></li>
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[10px]">Community</h4>
            <ul className="space-y-4">
              <li><Link href="/discord" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Discord Server</Link></li>
              <li><Link href="/events" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Tournaments</Link></li>
              <li><Link href="/blog" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Production Tips</Link></li>
              <li><Link href="/samples" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Sample Packs</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase tracking-widest text-[10px]">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/help" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Help Center</Link></li>
              <li><Link href="/privacy" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="text-gray-500 hover:text-neon-green text-sm transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-gray-600 text-xs">
            © 2026 FLRanked. All rights reserved. Built for producers, by producers.
          </div>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <Music className="w-3 h-3 text-neon-green" />
            <span>Powering the next generation of sound.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
