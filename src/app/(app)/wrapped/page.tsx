'use client';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { X, Sparkles, Trophy, Flame, Frown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function WrappedPage() {
  const router = useRouter();
  const { transactions, user } = useAppStore();
  const [slide, setSlide] = useState(0);

  // Kalkulasi data bulan ini
  const today = new Date();
  const thisMonthTx = transactions.filter(t => new Date(t.date).getMonth() === today.getMonth() && new Date(t.date).getFullYear() === today.getFullYear());
  const expenseTx = thisMonthTx.filter(t => t.type === 'expense' || t.type === 'debt_lend');
  const totalExpense = expenseTx.reduce((sum, t) => sum + t.amount, 0);

  const categoryTotals = expenseTx.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['Tidak ada', 0];

  const currentLevel = Math.floor((user.xp || 0) / 100) + 1;

  const slides = [
    {
      bg: "bg-indigo-600",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6 relative z-50">
          <Sparkles size={64} className="text-white animate-pulse" />
          <h1 className="text-4xl font-black text-white">Bulan Ini Hampir Usai...</h1>
          <p className="text-indigo-200 font-medium text-lg">Waktunya melihat dosa-dosa finansialmu, {user.name}!</p>
        </div>
      )
    },
    {
      bg: "bg-rose-600",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6 relative z-50">
          <Flame size={64} className="text-white animate-bounce" />
          <h1 className="text-2xl font-black text-white">Total Uang Yang Menguap</h1>
          <p className="text-5xl font-black text-white bg-black/20 p-4 rounded-3xl">Rp {totalExpense.toLocaleString('id-ID')}</p>
          <p className="text-rose-200 font-medium text-lg">Semoga jadi daging semua ya.</p>
        </div>
      )
    },
    {
      bg: "bg-amber-500",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6 relative z-50">
          <Frown size={64} className="text-white" />
          <h1 className="text-2xl font-black text-white">Dosa Terbesarmu Ada Di...</h1>
          <div className="bg-white/20 p-6 rounded-3xl w-full">
            <h2 className="text-3xl font-black text-white">{topCategory[0]}</h2>
            <p className="text-xl font-bold text-amber-100 mt-2">Rp {topCategory[1].toLocaleString('id-ID')}</p>
          </div>
          <p className="text-amber-100 font-medium text-lg">Kurang-kurangin ya bulan depan!</p>
        </div>
      )
    },
    {
      bg: "bg-emerald-600",
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6 px-6 relative z-50">
          <Trophy size={64} className="text-white" />
          <h1 className="text-3xl font-black text-white">Tapi Kamu Hebat!</h1>
          <p className="text-emerald-100 font-medium text-lg">Kamu berhasil mencapai Level {currentLevel} dengan {user.xp || 0} XP.</p>
          <p className="text-emerald-200 font-medium text-sm mt-8">Terus gunakan Dompet Mahasigma agar mimpimu segera terwujud.</p>
          <button onClick={() => router.push('/dashboard')} className="mt-8 bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-transform">
            Kembali ke Realita
          </button>
        </div>
      )
    }
  ];

  const nextSlide = () => { if (slide < slides.length - 1) setSlide(slide + 1); };
  const prevSlide = () => { if (slide > 0) setSlide(slide - 1); };

  return (
    <div className={cn("fixed inset-0 z-50 transition-colors duration-500 flex flex-col", slides[slide].bg)}>
      <div className="flex gap-2 p-4 pt-8">
        {slides.map((_, i) => (
          <div key={i} className={cn("h-1 flex-1 rounded-full transition-all duration-300", i <= slide ? "bg-white" : "bg-white/30")} />
        ))}
      </div>
      
      <button onClick={() => router.push('/dashboard')} className="absolute top-8 right-4 w-10 h-10 bg-black/20 text-white rounded-full flex items-center justify-center z-[60]">
        <X size={20} />
      </button>

      <div className="flex-1 relative flex flex-col">
        {slides[slide].content}
      </div>

      {/* Invisible tap areas */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-40" onClick={prevSlide} />
      <div className="absolute inset-y-0 right-0 w-2/3 z-40" onClick={nextSlide} />
    </div>
  );
}
