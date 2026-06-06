'use client';

import { useAppStore } from '@/store/useAppStore';
import { ArrowUpRight, ArrowDownRight, Wallet, Settings, PieChart as ChartIcon, Zap, Bot, Bell, Info, SlidersHorizontal, CheckCircle2, Loader2, Eye, EyeOff, Trophy, ChevronRight } from 'lucide-react';
import AddTransactionModal from '@/components/AddTransactionModal';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useState, useEffect } from 'react';
import { AlertModal } from '@/components/CustomUI';
import { useTranslation, translateCategory } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { id as localeId, enUS as localeEn } from 'date-fns/locale';

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const dateLocale = language === 'id' ? localeId : localeEn;
  const { user, updateUser, balance, categories, transactions, addTransaction, addDebt, notifications, markNotificationRead, clearNotifications, debts, goals } = useAppStore();

  const daysMap = { weekly: 7, biweekly: 14, monthly: 30 };
  const periodDays = daysMap[user.allowancePeriod] || 30;

  // 1. Hitung Sisa Hari (Days Left) secara dinamis
  const todayDateObj = new Date();
  const today = todayDateObj.getDate();
  const allowanceDateNum = parseInt(user.allowanceDate || '1', 10);
  let daysLeft = periodDays;
  let cycleStartDate = new Date(todayDateObj);

  if (user.allowancePeriod === 'monthly') {
    if (allowanceDateNum > today) {
      daysLeft = allowanceDateNum - today; // Gajian bulan ini belum lewat
      cycleStartDate = new Date(todayDateObj.getFullYear(), todayDateObj.getMonth() - 1, allowanceDateNum);
    } else {
      // Gajian bulan depan
      const daysInMonth = new Date(todayDateObj.getFullYear(), todayDateObj.getMonth() + 1, 0).getDate();
      daysLeft = (daysInMonth - today) + allowanceDateNum;
      cycleStartDate = new Date(todayDateObj.getFullYear(), todayDateObj.getMonth(), allowanceDateNum);
    }
  } else {
    // Untuk mingguan/dwi-mingguan
    daysLeft = Math.max(1, periodDays - (today % periodDays));
    cycleStartDate.setDate(todayDateObj.getDate() - (today % periodDays));
  }
  daysLeft = Math.max(1, daysLeft); // Hindari pembagian dengan 0

  // 2. Hitung Tanggungan (Hutang + Tabungan)
  const totalUnpaidDebts = (debts || []).filter(d => !d.isPaid).reduce((sum, d) => sum + d.amount, 0);

  const totalUnmetGoals = (goals || []).reduce((sum, g) => {
    const shortage = g.targetAmount - g.currentAmount;
    return sum + (shortage > 0 ? shortage : 0);
  }, 0);

  // Amankan maksimal 30% dari saldo untuk tabungan agar Sisa Jatah tidak langsung Rp 0 jika target besar
  const reserveForGoals = Math.min(totalUnmetGoals, balance * 0.3);

  // 3. Kalkulasi Sisa Uang Aman
  // Cadangkan 5% dari saldo asli sebagai dana darurat absolut
  const emergencyReserve = balance * 0.05;
  const safeBalance = Math.max(0, balance - totalUnpaidDebts - reserveForGoals - emergencyReserve);

  // 4. Batas Harian
  const calculatedSafeLimit = Math.floor(safeBalance / daysLeft);
  const isManualLimit = user.customSafeLimit?.isManual || false;
  const safeLimit = isManualLimit ? (user.customSafeLimit?.amount || calculatedSafeLimit) : calculatedSafeLimit;

  const [smartInput, setSmartInput] = useState('');
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', isError: false });
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [tempManualLimit, setTempManualLimit] = useState(false);
  const [tempLimitAmount, setTempLimitAmount] = useState('');
  const [isSmartLoading, setIsSmartLoading] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  const currentXp = user.xp || 0;
  const currentLevel = Math.floor(currentXp / 100) + 1;
  const rankNames = ["Sigma Pemula", "Sigma Hustler", "Sigma Boss", "Sigma God", "Sigma CEO"];
  const currentRank = rankNames[Math.min(currentLevel - 1, rankNames.length - 1)];

  useEffect(() => {
    const savedHidden = localStorage.getItem('isBalanceHidden') === 'true';
    setIsBalanceHidden(savedHidden);
  }, []);

  const toggleBalance = () => {
    const newVal = !isBalanceHidden;
    setIsBalanceHidden(newVal);
    localStorage.setItem('isBalanceHidden', String(newVal));
  };

  const unreadCount = (notifications || []).filter(n => !n.isRead).length;

  const handleOpenLimitModal = () => {
    setTempManualLimit(user.customSafeLimit?.isManual || false);
    const initialAmount = user.customSafeLimit?.amount || calculatedSafeLimit;
    setTempLimitAmount(new Intl.NumberFormat('id-ID').format(initialAmount));
    setIsLimitModalOpen(true);
  };

  const handleLimitAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (!rawValue) { setTempLimitAmount(''); return; }
    setTempLimitAmount(new Intl.NumberFormat('id-ID').format(parseInt(rawValue, 10)));
  };

  const handleSaveLimit = () => {
    const rawAmount = parseInt(tempLimitAmount.replace(/\./g, ''), 10);
    const amountNum = rawAmount || calculatedSafeLimit;
    updateUser({ customSafeLimit: { isManual: tempManualLimit, amount: amountNum } });
    setIsLimitModalOpen(false);
  };

  const handleSmartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smartInput.trim() || isSmartLoading) return;

    setIsSmartLoading(true);

    try {
      const response = await fetch('/api/smart-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: smartInput })
      });

      if (!response.ok) throw new Error('API Error');
      const data = await response.json();

      if (!data.title || !data.amount || !data.type) {
        throw new Error('Invalid format');
      }

      let success = false;

      if (data.type === 'debt_lend') {
        success = addDebt({ borrowerName: data.title, amount: data.amount });
      } else {
        success = addTransaction({
          title: data.title,
          amount: data.amount,
          type: data.type,
          category: data.category || (data.type.includes('debt') ? 'Hutang' : categories[0]?.name || 'Umum'),
          date: new Date().toISOString()
        });
      }

      if (success) {
        const typeText = data.type === 'expense' ? 'Pengeluaran' : data.type === 'income' ? 'Pemasukan' : data.type === 'debt_lend' ? 'Piutang' : 'Hutang';
        setAlertData({ isOpen: true, title: 'Tercatat Cerdas!', message: `${typeText} "${data.title}" sebesar Rp ${data.amount.toLocaleString('id-ID')} berhasil dicatat oleh AI.`, isError: false });
        setSmartInput('');
      } else {
        setAlertData({ isOpen: true, title: 'Saldo Kurang', message: 'Saldo utama kamu tidak mencukupi untuk pencatatan ini.', isError: true });
      }

    } catch (error) {
      setAlertData({ isOpen: true, title: 'Gagal Memahami', message: 'Sigma AI gagal memproses input kamu. Coba gunakan bahasa yang lebih jelas atau format nominal yang benar.', isError: true });
    } finally {
      setIsSmartLoading(false);
    }
  };

  const expenseData = categories.map(cat => {
    const spent = transactions.filter(tx => tx.category === cat.name && (tx.type === 'expense' || tx.type === 'debt_lend')).reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { name: translateCategory(cat.name, language), value: spent };
  }).filter(d => d.value > 0);

  const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444'];

  return (
    <div className="p-6 pt-0 space-y-6">
      {/* 1. TOP BAR */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md pt-6 pb-4 -mx-6 px-6 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center gap-3 bg-card p-1.5 pr-4 rounded-full shadow-sm border border-border">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl shadow-inner overflow-hidden border border-primary/20 shrink-0">
            {/* FIX FOTO GOOGLE: Tambahkan referrerPolicy="no-referrer" */}
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <span>{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-sm font-black text-foreground tracking-tight truncate">{user.name}</h1>
            <Link href="/leveling" className="inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 bg-primary/10 hover:bg-primary/20 transition-colors rounded-full cursor-pointer">
              <span className="text-[9px] font-extrabold bg-primary text-primary-foreground px-1.5 rounded-full uppercase tracking-wider">Lv.{currentLevel}</span>
              <span className="text-[10px] font-bold text-primary truncate max-w-[80px]">{currentRank}</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href="/notifications" className="relative w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-md animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="w-10 h-10 bg-card rounded-xl border border-border flex items-center justify-center text-foreground transition-all hover:scale-105 active:scale-95 shadow-sm">
            <Settings size={20} />
          </Link>
        </div>
      </div>

      {/* 2. BALANCE CARD */}
      <div className="bg-[#00aed6] dark:bg-[#1e293b] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-2 opacity-90 relative z-10">
          <Wallet size={16} className="text-white" />
          <span className="text-xs font-bold uppercase tracking-wider">{t('balance')}</span>
          <button onClick={toggleBalance} className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors">
            {isBalanceHidden ? <EyeOff size={14} className="text-white/80" /> : <Eye size={14} className="text-white/80" />}
          </button>
        </div>
        <h2 className="text-4xl font-black mt-2 tracking-tight relative z-10">
          {isBalanceHidden ? 'Rp •••••••' : `Rp ${balance.toLocaleString('id-ID')}`}
        </h2>

        <div className="mt-5 pt-4 border-t border-white/20 flex justify-between items-center text-xs relative z-10">
          <div className="flex items-center gap-2">
            <span className="opacity-90 font-medium">{t('safeLimit')} ({daysLeft} {t('daysLeftText')})</span>
            <button onClick={handleOpenLimitModal} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors shadow-inner flex items-center justify-center">
              <SlidersHorizontal size={14} className="text-white" />
            </button>
          </div>
          <span className="font-black bg-white/20 px-3 py-1.5 rounded-lg shadow-inner flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-pulse" title={isManualLimit ? "Mode Manual Aktif" : "Mode AI Aktif"} />
            Rp {safeLimit.toLocaleString('id-ID')} / {t('day')}
          </span>
        </div>
        <div className="absolute -top-12 -right-10 w-40 h-40 bg-white/10 rounded-full blur-lg pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-md pointer-events-none"></div>
      </div>

      {/* 3. TRITUNGGAL LOGIS */}
      <div className="flex gap-3">
        <AddTransactionModal
          initialType="expense"
          trigger={
            <button className="flex-1 h-24 rounded-3xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 transform-gpu shadow-sm">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md">
                <ArrowDownRight size={22} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-extrabold text-rose-700 dark:text-rose-400 uppercase tracking-wider">{t('expense')}</span>
            </button>
          }
        />
        <AddTransactionModal
          initialType="income"
          trigger={
            <button className="flex-1 h-24 rounded-3xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 transform-gpu shadow-sm">
              <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
                <ArrowUpRight size={22} strokeWidth={3} />
              </div>
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{t('income')}</span>
            </button>
          }
        />
        <Link href="/chat" className="flex-1 h-24 rounded-3xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 transform-gpu shadow-sm">
          <div className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-md">
            <Bot size={22} strokeWidth={3} />
          </div>
          <span className="text-[11px] font-extrabold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Sigma AI</span>
        </Link>
      </div>

      {/* 4. SMART INPUT */}
      <div className="pt-2">
        <div className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><Zap size={20} className="fill-primary" /></div>
            <h4 className="text-base font-extrabold text-foreground tracking-tight">{t('smartInput')}</h4>
          </div>
          <form onSubmit={handleSmartSubmit} className="relative flex items-center">
            <input type="text" value={smartInput} onChange={(e) => setSmartInput(e.target.value)} placeholder={t('smartInputPlaceholder')} disabled={isSmartLoading} className="w-full h-14 rounded-2xl bg-muted/50 border border-border pl-4 pr-16 text-sm font-bold focus:border-primary focus:bg-background focus:outline-none transition-all shadow-inner placeholder:text-muted-foreground/70 disabled:opacity-70" />
            <button type="submit" disabled={isSmartLoading} className="absolute right-1.5 w-11 h-11 rounded-xl bg-primary hover:opacity-90 active:scale-95 text-primary-foreground flex items-center justify-center transition-all shadow-sm disabled:opacity-70 disabled:scale-100">
              {isSmartLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowDownRight size={20} strokeWidth={3} />}
            </button>
          </form>
          <div className="bg-primary/10 border border-primary/20 text-primary p-3.5 rounded-2xl flex gap-3 items-start shadow-inner">
            <div className="shrink-0 mt-0.5"><Info size={20} /></div>
            <p className="text-xs font-medium leading-relaxed" dangerouslySetInnerHTML={{ __html: t('smartInputHint') }}></p>
          </div>
        </div>
      </div>

      {/* 5. ANALYTICS CHART */}
      <div className="pt-2">
        <div className="p-5 bg-card border border-border rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ChartIcon size={20} className="text-primary" />
            <h4 className="text-sm font-bold text-foreground">{t('analytics')}</h4>
          </div>
          {expenseData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm font-bold text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border">{t('noData')}</div>
          ) : (
            <div className="h-48 w-full min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                <PieChart>
                  <Pie data={expenseData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {expenseData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => `Rp ${Number(value || 0).toLocaleString('id-ID')}`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {expenseData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {expenseData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div><span className="text-xs font-bold text-muted-foreground">{entry.name}</span></div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertModal isOpen={alertData.isOpen} onClose={() => setAlertData({ ...alertData, isOpen: false })} title={alertData.title} message={alertData.message} isError={alertData.isError} />

      <Dialog open={isLimitModalOpen} onOpenChange={setIsLimitModalOpen}>
        <DialogContent className="sm:max-w-md w-[92vw] rounded-3xl p-6 bg-card border border-border shadow-2xl overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
              <SlidersHorizontal size={22} className="text-primary" /> {t('limitSettings')}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            <div className="flex bg-muted rounded-xl p-1 w-full shadow-inner">
              <button onClick={() => setTempManualLimit(false)} className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${!tempManualLimit ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Zap size={14} /> {t('autoAI')}
              </button>
              <button onClick={() => setTempManualLimit(true)} className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${tempManualLimit ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <SlidersHorizontal size={14} /> {t('manualSet')}
              </button>
            </div>

            <div className={`space-y-4 transition-opacity duration-300 ${!tempManualLimit ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">{t('maxDailySpend')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">Rp</span>
                  <input type="text" inputMode="numeric" value={tempLimitAmount} onChange={handleLimitAmountChange} disabled={!tempManualLimit} className="w-full h-14 bg-background border border-border rounded-xl pl-11 pr-4 text-sm font-bold text-foreground focus:border-primary focus:outline-none shadow-sm disabled:opacity-50 disabled:bg-muted/50" placeholder="50.000" />
                </div>
              </div>
            </div>

            {!tempManualLimit && (
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-xl flex items-start gap-3 shadow-inner">
                <Info size={20} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-foreground leading-relaxed">
                  {t('aiLimitDesc1')} <strong className="text-primary tracking-wide">Rp {calculatedSafeLimit.toLocaleString('id-ID')}</strong> {t('aiLimitDesc2')} {daysLeft} {t('aiLimitDesc3')}
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              <button onClick={() => setIsLimitModalOpen(false)} className="flex-1 h-12 bg-muted text-foreground font-bold rounded-xl hover:bg-border transition-colors">
                {t('cancel')}
              </button>
              <button onClick={handleSaveLimit} className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95">
                <CheckCircle2 size={18} /> {t('save')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}