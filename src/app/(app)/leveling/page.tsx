'use client';

import { useAppStore } from '@/store/useAppStore';
import { ChevronLeft, Trophy, Star, Crown, Zap, Gift, Target, ArrowUpCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const RANKS = [
  { name: "Sigma Pemula", minXp: 0, icon: <Star size={24} className="text-slate-400" />, benefits: "Akses fitur dasar, masih suka khilaf jajan." },
  { name: "Sigma Hustler", minXp: 100, icon: <Zap size={24} className="text-amber-500" />, benefits: "Mulai pintar atur uang, paham bahaya pinjol." },
  { name: "Sigma Boss", minXp: 200, icon: <Target size={24} className="text-emerald-500" />, benefits: "Tahan banting lihat diskon, tabungan mulai gemuk." },
  { name: "Sigma God", minXp: 300, icon: <Trophy size={24} className="text-indigo-500" />, benefits: "Dewa finansial, temen-temen mulai minjam uang ke kamu." },
  { name: "Sigma CEO", minXp: 400, icon: <Crown size={24} className="text-rose-500" />, benefits: "Uang yang bekerja untukmu. Kamu bebas finansial!" }
];

export default function LevelingPage() {
  const { user } = useAppStore();
  const currentXp = user.xp || 0;
  const currentLevel = Math.floor(currentXp / 100) + 1;
  const rankIndex = Math.min(currentLevel - 1, RANKS.length - 1);
  const currentRank = RANKS[rankIndex];
  
  const xpForNextLevel = currentLevel * 100;
  const progressPercent = Math.min(100, (currentXp % 100));

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* HEADER TIER (INTERACTIVE LIKE PROVIDER APP) */}
      <div className="bg-primary px-6 pt-10 pb-20 rounded-b-[3rem] text-primary-foreground relative overflow-hidden shadow-xl">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute top-20 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
        
        <div className="flex justify-between items-center relative z-10 mb-8">
          <Link href="/dashboard" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <span className="text-sm font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">Member Area</span>
        </div>

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 transform hover:scale-105 transition-transform">
            {currentRank.icon}
          </div>
          <h1 className="text-3xl font-black tracking-tight">{currentRank.name}</h1>
          <p className="font-medium text-primary-foreground/80 mt-1">Level {currentLevel}</p>
        </div>
      </div>

      {/* PROGRESS CARD (OVERLAPPING HEADER) */}
      <div className="px-6 -mt-12 relative z-20">
        <div className="bg-card rounded-3xl p-6 shadow-xl border border-border">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total XP Kamu</p>
              <h2 className="text-3xl font-black text-primary mt-1">{currentXp} <span className="text-base text-muted-foreground">XP</span></h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground">Menuju Level {currentLevel + 1}</p>
              <p className="text-sm font-bold text-foreground">{xpForNextLevel - currentXp} XP lagi</p>
            </div>
          </div>

          <div className="w-full bg-muted rounded-full h-4 mb-2 overflow-hidden shadow-inner relative">
            <div className="bg-gradient-to-r from-primary to-indigo-500 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
            {/* Shimmer effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
          <p className="text-xs font-medium text-center text-muted-foreground mt-3 flex items-center justify-center gap-1">
            <ArrowUpCircle size={14} className="text-primary"/> Rajin catat kas untuk kumpulkan XP!
          </p>
        </div>
      </div>

      {/* REWARDS & TIERS */}
      <div className="px-6 mt-8 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Gift size={20} className="text-primary" />
          <h3 className="text-lg font-black text-foreground tracking-tight">Keuntungan Pangkat</h3>
        </div>

        <div className="space-y-3">
          {RANKS.map((rank, idx) => {
            const isUnlocked = currentLevel >= idx + 1;
            const isCurrent = rankIndex === idx;

            return (
              <div key={idx} className={cn(
                "p-4 rounded-2xl border transition-all flex items-center gap-4",
                isCurrent ? "bg-primary/10 border-primary shadow-sm ring-1 ring-primary/20" : 
                isUnlocked ? "bg-card border-border shadow-sm" : "bg-muted/50 border-dashed border-border opacity-70 grayscale"
              )}>
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm", isUnlocked ? "bg-white dark:bg-slate-800" : "bg-muted")}>
                  {rank.icon}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className={cn("font-bold", isUnlocked ? "text-foreground" : "text-muted-foreground")}>{rank.name}</h4>
                    {isCurrent && <span className="text-[9px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase">Saat Ini</span>}
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mt-1 leading-relaxed">{rank.benefits}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
