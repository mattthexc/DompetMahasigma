'use client';

import { useAppStore } from '@/store/useAppStore';
import { ChevronLeft, Send, Sparkles, Bot, User, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ConfirmModal } from '@/components/CustomUI';

export default function ChatPage() {
  const { user, balance, transactions, goals, debts, chatMessages, addChatMessage, clearChat } = useAppStore();
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat ada pesan baru atau sedang loading
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    
    // Simpan pesan user ke Database Zustand
    addChatMessage({ id: Date.now().toString(), sender: 'user', text: userMessage });

    const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const recentTransactions = transactions.slice(0, 5).map(t => `${t.title} (${t.type === 'expense' ? '-' : '+'}Rp${t.amount})`);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          financialData: { balance, income, expense, recentTransactions, goals, debts }
        })
      });

      const data = await response.json();

      if (response.ok) {
        addChatMessage({ id: (Date.now() + 1).toString(), sender: 'ai', text: data.reply });
      } else {
        addChatMessage({ id: (Date.now() + 1).toString(), sender: 'ai', text: `⚠️ Error Server: ${data.error}` });
      }
    } catch (error) {
      addChatMessage({ id: (Date.now() + 1).toString(), sender: 'ai', text: '⚠️ Gawat, koneksi internet lu kayaknya putus atau server mati total.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
  };

  return (
    <div className="absolute inset-0 z-[100] flex flex-col bg-muted/10 w-full h-full overflow-hidden">
      
      {/* HEADER */}
      <div className="shrink-0 flex items-center px-6 py-4 border-b border-border/50 bg-background/90 backdrop-blur-xl shadow-sm z-10 pt-safe">
        <div className="max-w-md w-full mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-foreground hover:bg-muted/80 transition-colors shadow-sm">
              <ChevronLeft size={24} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                <Bot size={22} />
              </div>
              <div>
                <h1 className="text-lg font-black text-foreground tracking-tight leading-none mb-1">Sigma AI</h1>
                <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={10} /> Model Llama 3.1
                </p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setIsConfirmOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* ZONA CHATTING */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 w-full max-w-md mx-auto">
        
        {/* PESAN SELAMAT DATANG (Hanya muncul jika chat masih kosong murni UI visual) */}
        {chatMessages.length === 0 && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-indigo-500/10 text-indigo-500">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap bg-card border border-border text-foreground rounded-tl-sm">
              Halo Sigma {user.name}! Otak Backend gw udah online 100%. Data keuangan lu udah siap gw obrak-abrik. Mau nanya apa hari ini?
            </div>
          </div>
        )}

        {/* RENDER DATABASE CHAT (FIX: Menggunakan kombinasi index agar key 100% unik) */}
        {chatMessages.map((msg, index) => (
          <div key={`${msg.id}-${index}`} className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'user' ? 'bg-primary/10 text-primary' : 'bg-indigo-500/10 text-indigo-500'}`}>
              {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap
              ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border text-foreground rounded-tl-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* ANIMASI LOADING */}
        {isLoading && (
          <div className="flex gap-3 max-w-[90%]">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-indigo-500/10 text-indigo-500">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm bg-card border border-border text-foreground rounded-tl-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-indigo-500" /> 
              <span className="text-muted-foreground animate-pulse">Sedang meracik kalimat roasting...</span>
            </div>
          </div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* INPUT AREA */}
      <div className="shrink-0 p-4 border-t border-border bg-card shadow-[0_-10px_30px_rgba(0,0,0,0.05)] pb-safe">
        <div className="max-w-md w-full mx-auto space-y-3">
          
          <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
            {['Roasting pengeluaranku!', 'Saran ngerem pengeluaran', 'Review sisa saldoku'].map((tmpl, i) => (
              <button key={i} onClick={() => handleQuickPrompt(tmpl)} className="whitespace-nowrap px-4 py-2 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border border-indigo-500/20 hover:bg-indigo-500/10 transition-colors shadow-sm">
                {tmpl}
              </button>
            ))}
          </div>

          <form onSubmit={handleSend} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Tanya Sigma AI..." 
              className="w-full h-14 rounded-2xl bg-muted/50 border border-border pl-5 pr-16 text-sm font-bold focus:border-indigo-500 focus:bg-background focus:outline-none transition-all shadow-inner placeholder:text-muted-foreground/70 disabled:opacity-50" 
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              className="absolute right-1.5 w-11 h-11 rounded-xl bg-indigo-500 hover:opacity-90 disabled:opacity-50 active:scale-95 text-white flex items-center justify-center transition-all shadow-sm"
            >
              <Send size={18} className="ml-1" />
            </button>
          </form>
          
        </div>
      </div>

      <ConfirmModal 
        isOpen={isConfirmOpen} 
        onClose={() => setIsConfirmOpen(false)} 
        onConfirm={() => {
          clearChat();
          setIsConfirmOpen(false);
        }} 
        title="Hapus Riwayat Chat?" 
        message="Semua percakapan dengan Sigma AI akan dihapus permanen dari ingatan." 
        confirmText="Ya, Hapus"
      />
    </div>
  );
}