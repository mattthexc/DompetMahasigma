'use client';

import { useAppStore } from '@/store/useAppStore';
import { Plus, Trash2, Check, X, Coins, Target, CalendarDays, AlertCircle, MoreHorizontal, Pencil } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { differenceInDays, format, parseISO } from 'date-fns';
import { id as localeId, enUS as localeEn } from 'date-fns/locale';
import { ConfirmModal, AlertModal, CustomDatePicker } from '@/components/CustomUI';
import { useTranslation, getAITip } from '@/lib/i18n';
import { getDynamicEmoji } from '@/lib/utils';

export default function GoalsPage() {
  const { t, language } = useTranslation();
  const dateLocale = language === 'id' ? localeId : localeEn;
  const { goals = [], addGoal, updateGoal, deleteGoal, addGoalProgress, balance } = useAppStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [optionsGoalId, setOptionsGoalId] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalDeadline, setNewGoalDeadline] = useState('');

  const [progressModalOpenFor, setProgressModalOpenFor] = useState<string | null>(null);
  const [progressAmount, setProgressAmount] = useState('');

  // STATE UNTUK CUSTOM UI
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', isError: true });

  const openModal = (goal?: any) => {
    if (goal) {
      setEditingId(goal.id);
      setNewGoalName(goal.name);
      setNewGoalTarget(new Intl.NumberFormat('id-ID').format(goal.targetAmount));
      setNewGoalDeadline(goal.deadline || '');
    } else {
      setEditingId(null);
      setNewGoalName('');
      setNewGoalTarget('');
      setNewGoalDeadline('');
    }
    setIsAddModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetValue = parseInt(newGoalTarget.replace(/\./g, ''), 10);
    if (!newGoalName.trim() || !targetValue) return;

    const dynamicIcon = getDynamicEmoji(newGoalName, '🎯');

    if (editingId) {
      updateGoal(editingId, { name: newGoalName, targetAmount: targetValue, icon: dynamicIcon, deadline: newGoalDeadline ? newGoalDeadline : undefined });
    } else {
      addGoal({ name: newGoalName, targetAmount: targetValue, icon: dynamicIcon, deadline: newGoalDeadline ? newGoalDeadline : undefined });
    }
    setIsAddModalOpen(false);
  };

  const handleSaveProgress = (e: React.FormEvent, goalId: string, goalName: string) => {
    e.preventDefault();
    const amountToSave = parseInt(progressAmount.replace(/\./g, ''), 10);
    if (!amountToSave || amountToSave <= 0) return;

    const success = addGoalProgress(goalId, amountToSave);
    if (!success) {
      setAlertData({ isOpen: true, title: 'Saldo Tidak Cukup', message: 'Saldo utama kamu tidak mencukupi untuk menabung sebesar ini.', isError: true });
      return;
    }

    setAlertData({ isOpen: true, title: 'Tabungan Bertambah! 🎉', message: `Uang sebesar Rp ${amountToSave.toLocaleString('id-ID')} berhasil masuk ke celengan "${goalName}". Semangat terus nabungnya!`, isError: false });
    setProgressModalOpenFor(null);
    setProgressAmount('');
  };



  const renderAITip = (goal: any, currentBalance: number, isComplete: boolean) => {
    if (isComplete) return null;
    const shortage = goal.targetAmount - goal.currentAmount;
    const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), new Date()) : 0;
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;

    const tip = getAITip(language, !!goal.deadline, daysLeft, shortage, percentage, currentBalance);

    return (
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 mt-3 shadow-inner">
        <p className="text-[11px] font-medium text-foreground/80 leading-relaxed italic">{tip}</p>
      </div>
    );
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 pt-8 pb-4 flex justify-between items-center mt-0">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t('goals')}</h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{t('goalsDesc')}</p>
        </div>
        <button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors active:scale-95 shadow-sm">
          <Plus size={16} strokeWidth={3} /> {t('newGoal')}
        </button>
      </div>

      <div className="p-6 space-y-4 pt-4">
        <Dialog open={isAddModalOpen} onOpenChange={(open) => {
          setIsAddModalOpen(open);
          if (!open) { setEditingId(null); setNewGoalName(''); setNewGoalTarget(''); setNewGoalDeadline(''); }
        }}>
          <DialogContent className="sm:max-w-[425px] w-[92vw] rounded-3xl p-6 bg-card border border-border shadow-2xl [&>button.absolute]:hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-foreground">{editingId ? 'Edit Tabungan' : t('newGoalTitle')}</DialogTitle>
              <DialogDescription className="sr-only">Atur tabungan</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveGoal} className="space-y-5 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('goalName')}</label>
                <input type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} required className="w-full h-14 bg-background border border-border rounded-xl px-4 font-bold text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('targetAmount')}</label>
                <input type="text" inputMode="numeric" value={newGoalTarget} onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setNewGoalTarget(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '');
                }} required placeholder="0" className="w-full h-14 bg-background border border-border rounded-xl px-4 font-black text-xl text-foreground focus:border-primary focus:outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('targetDate')}</label>
                <CustomDatePicker value={newGoalDeadline} onChange={setNewGoalDeadline} placeholder={t('targetDate')} />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 h-14 bg-muted text-foreground text-lg font-bold rounded-xl hover:bg-border transition-colors">{t('cancel')}</button>
                <button type="submit" className="flex-1 h-14 bg-primary text-primary-foreground text-lg font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">{t('saveTarget')}</button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* LIST TABUNGAN */}
        {goals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 bg-card rounded-3xl border border-dashed border-border shadow-sm">
            <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center shadow-inner"><Target size={32} strokeWidth={2} /></div>
            <div>
              <p className="text-base font-bold text-foreground">{t('noTarget')}</p>
              <p className="text-xs font-medium text-muted-foreground mt-1">{t('startTarget')}</p>
            </div>
          </div>
        ) : (
          goals.map((goal) => {
            const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isComplete = percentage >= 100;

            // Format target date badge
            let targetDateBadge = null;
            if (goal.deadline) {
              const targetDate = parseISO(goal.deadline);
              const daysLeft = differenceInDays(targetDate, new Date());
              const formattedDate = format(targetDate, 'dd MMM yyyy', { locale: dateLocale });

              const badgeClass = isComplete
                ? 'text-emerald-500 bg-emerald-500/10'
                : daysLeft < 0
                  ? 'text-rose-500 bg-rose-500/10 border-rose-500/20'
                  : daysLeft <= 7
                    ? 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                    : 'text-primary bg-primary/10 border-primary/20';

              targetDateBadge = (
                <span className={`px-2 py-0.5 rounded-md border shadow-sm text-[9px] font-black uppercase tracking-widest flex items-center gap-1 ${badgeClass}`}>
                  <CalendarDays size={10} />
                  {daysLeft < 0 ? `Terlewat ${Math.abs(daysLeft)} hari` : daysLeft === 0 ? 'Hari ini!' : formattedDate}
                </span>
              );
            }

            return (
              <div key={goal.id} className={`p-5 bg-card rounded-3xl border ${isComplete ? 'border-emerald-500 shadow-emerald-500/20' : 'border-border'} shadow-sm space-y-4 relative overflow-hidden`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 relative z-10 min-w-0">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl text-xl shrink-0 shadow-inner ${isComplete ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>{goal.icon}</div>
                    <div className="min-w-0">
                      <h3 className="font-extrabold text-lg text-foreground tracking-tight flex items-center flex-wrap gap-2">
                        {goal.name}
                        {targetDateBadge}
                      </h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 truncate">{t('collected')} {goal.currentAmount.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative z-10 shrink-0 ml-2">
                    <button onClick={() => setOptionsGoalId(goal.id)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    <span className={isComplete ? "text-emerald-500" : "text-primary"}>
                      {percentage.toFixed(1)}% (Rp {goal.currentAmount.toLocaleString('id-ID')})
                    </span>
                    <span>{t('target')} Rp {goal.targetAmount.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="h-4 w-full bg-background rounded-full overflow-hidden border border-border/50 shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${isComplete ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${percentage}%` }}>
                      <div className="absolute inset-0 bg-white/20 w-full h-full skew-x-12 -ml-4" />
                    </div>
                  </div>

                  {renderAITip(goal, balance, isComplete)}

                  {!isComplete && (
                    <Dialog open={progressModalOpenFor === goal.id} onOpenChange={(open) => { if (open) { setProgressModalOpenFor(goal.id); setProgressAmount(''); } else { setProgressModalOpenFor(null); } }}>
                      <DialogTrigger asChild>
                        <button className="w-full h-12 mt-2 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-sm shadow-sm active:scale-95"><Coins size={18} /> {t('saveNow')}</button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px] w-[92vw] rounded-3xl p-6 bg-card border border-border shadow-2xl">
                        <DialogHeader><DialogTitle className="text-xl font-black text-foreground">{t('saveNow')} - {goal.name}</DialogTitle></DialogHeader>
                        <form onSubmit={(e) => handleSaveProgress(e, goal.id, goal.name)} className="space-y-6 mt-2">
                          <div className="flex flex-col items-center justify-center py-6 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">{t('availableBalance')}</span>
                            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">Rp {balance.toLocaleString('id-ID')}</span>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{t('saveAmount')}</label>
                            <input type="text" inputMode="numeric" value={progressAmount} onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              setProgressAmount(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '');
                            }} required placeholder="0" className="w-full h-14 bg-background border-2 border-border rounded-xl px-4 font-black text-xl text-center focus:border-primary focus:outline-none transition-colors" />
                          </div>
                          <div className="flex gap-3">
                            <button type="button" onClick={() => setProgressModalOpenFor(null)} className="flex-1 h-14 bg-muted text-foreground text-lg font-bold rounded-xl hover:bg-border transition-colors">{t('cancel')}</button>
                            <button type="submit" className="flex-1 h-14 bg-primary text-primary-foreground text-lg font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">{t('confirmSave')}</button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                  {isComplete && <p className="text-xs font-bold text-center text-emerald-500 animate-pulse mt-2">{t('goalReached')}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!optionsGoalId} onOpenChange={(open) => !open && setOptionsGoalId(null)}>
        <DialogContent className="sm:max-w-[300px] w-[80vw] rounded-3xl p-6 bg-card border border-border shadow-2xl [&>button.absolute]:hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-center text-foreground">Opsi Tabungan</DialogTitle>
            <DialogDescription className="sr-only">Pilih aksi untuk tabungan</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <button onClick={() => {
              const goal = goals.find(c => c.id === optionsGoalId);
              setOptionsGoalId(null);
              if (goal) openModal(goal);
            }} className="w-full h-12 bg-muted text-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-border transition-colors">
              <Pencil size={16} /> Edit Tabungan
            </button>
            <button onClick={() => {
              setConfirmDelete(optionsGoalId);
              setOptionsGoalId(null);
            }} className="w-full h-12 bg-rose-500/10 text-rose-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-colors">
              <Trash2 size={16} /> Hapus Tabungan
            </button>
            <button onClick={() => setOptionsGoalId(null)} className="w-full h-12 bg-transparent text-muted-foreground font-bold rounded-xl hover:bg-muted transition-colors mt-2">
              {t('cancel')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteGoal(confirmDelete); }}
        title={t('deleteGoalTitle')}
        message={t('deleteGoalMsg')}
      />
      <AlertModal
        isOpen={alertData.isOpen}
        onClose={() => setAlertData({ ...alertData, isOpen: false })}
        title={alertData.title}
        message={alertData.message}
        isError={alertData.isError}
      />
    </div>
  );
}