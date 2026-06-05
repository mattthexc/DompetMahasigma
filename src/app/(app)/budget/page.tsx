'use client';

import { useAppStore } from '@/store/useAppStore';
import { PieChart as ChartIcon, Plus, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { ConfirmModal } from '@/components/CustomUI';
import { useTranslation, translateCategory, getBudgetAITip } from '@/lib/i18n';
import { getDynamicEmoji } from '@/lib/utils';
import { parseISO, startOfMonth, isAfter } from 'date-fns';

export default function BudgetPage() {
  const { t, language } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory, transactions, user } = useAppStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [optionsCatId, setOptionsCatId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [icon, setIcon] = useState('📦');
  const [period, setPeriod] = useState<'monthly' | 'cycle'>('monthly');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // KECERDASAN LOGIKA: Auto-Emoji Kategori
  const handleNameChange = (val: string) => {
    setName(val);
    setIcon(getDynamicEmoji(val));
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setLimit(raw ? new Intl.NumberFormat('id-ID').format(parseInt(raw, 10)) : '');
  };

  const openModal = (cat?: any) => {
    if (cat) {
      setEditingId(cat.id); 
      setName(cat.name); 
      setIcon(cat.icon);
      setLimit(new Intl.NumberFormat('id-ID').format(cat.limitAmount));
      setPeriod(cat.period || 'monthly');
    } else {
      setEditingId(null); 
      setName(''); 
      setIcon('📦'); 
      setLimit('');
      setPeriod('monthly');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    const limitNum = parseInt(limit.replace(/\./g, ''), 10) || 0;
    if (!name.trim() || limitNum <= 0) return;

    if (editingId) {
      updateCategory(editingId, { name, limitAmount: limitNum, icon, period });
    } else {
      addCategory({ name, limitAmount: limitNum, icon, period });
    }
    
    setIsModalOpen(false);
  };

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 pt-8 pb-4 flex justify-between items-center mt-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <ChartIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight">{t('budget')}</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t('budgetDesc')}</p>
          </div>
        </div>

        <button onClick={() => openModal()} className="flex items-center gap-1.5 px-3 py-2.5 bg-primary/10 text-primary rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors active:scale-95 shadow-sm">
          <Plus size={16} strokeWidth={3} /> Kategori
        </button>

        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setEditingId(null);
            setName('');
            setIcon('📦');
            setLimit('');
            setPeriod('monthly');
          }
        }}>
          <DialogContent className="sm:max-w-[400px] w-[90vw] rounded-3xl p-6 bg-card border border-border shadow-2xl [&>button.absolute]:hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-foreground">{editingId ? t('editCategory') : t('newCategoryTitle')}</DialogTitle>
              <DialogDescription className="sr-only">Atur kategori pengeluaran</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              
              <div className="flex gap-3">
                <div className="w-14 h-14 bg-muted border border-border rounded-xl flex items-center justify-center text-2xl shrink-0">
                  {icon}
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('categoryName')}</label>
                  <input type="text" value={name} onChange={(e) => handleNameChange(e.target.value)} className="w-full h-14 bg-background border border-border rounded-xl px-4 font-bold text-foreground focus:border-primary focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('budgetLimit')}</label>
                <input type="text" inputMode="numeric" value={limit} onChange={handleLimitChange} placeholder="0" className="w-full h-14 bg-background border border-border rounded-xl px-4 font-black text-lg text-foreground focus:border-primary focus:outline-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Periode Anggaran</label>
                <div className="flex bg-muted rounded-xl p-1 w-full shadow-inner">
                  <button onClick={() => setPeriod('monthly')} className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${period === 'monthly' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    Bulanan
                  </button>
                  <button onClick={() => setPeriod('cycle')} className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${period === 'cycle' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                    Per Pemasukan
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 h-12 bg-muted text-foreground font-bold rounded-xl hover:bg-border transition-colors">{t('cancel')}</button>
                <button onClick={handleSave} className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:opacity-90 transition-all">{t('save')}</button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="p-6 space-y-4 pt-4">
        {categories.map(cat => {
          // Menentukan tanggal mulai periode anggaran
          let startDate = startOfMonth(new Date());
          if (cat.period === 'cycle' && user.allowanceDate) {
            const allowanceDateObj = parseISO(user.allowanceDate);
            const allowanceDay = allowanceDateObj.getDate();
            const today = new Date();
            if (today.getDate() < allowanceDay) {
               // Berarti siklus sebelumnya dimulai di bulan lalu
               startDate = new Date(today.getFullYear(), today.getMonth() - 1, allowanceDay);
            } else {
               startDate = new Date(today.getFullYear(), today.getMonth(), allowanceDay);
            }
          }

          const spent = transactions
            .filter(t => t.category === cat.name && t.type === 'expense')
            .filter(t => isAfter(parseISO(t.date), startDate))
            .reduce((acc, curr) => acc + curr.amount, 0);
            
          const percent = Math.min((spent / cat.limitAmount) * 100, 100);
          const isOver = spent > cat.limitAmount;

          return (
            <div key={cat.id} className="bg-card border border-border rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${isOver ? 'bg-rose-500/10' : 'bg-primary/10'}`}>
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground">{translateCategory(cat.name, language)}</h3>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                      {isOver ? t('overbudget') : t('safe')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-md bg-background border border-border shadow-sm text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    {cat.period === 'cycle' ? 'Siklus' : 'Bulanan'}
                  </span>
                  <button onClick={() => setOptionsCatId(cat.id)} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className={isOver ? 'text-rose-500' : 'text-foreground'}>Rp {spent.toLocaleString('id-ID')}</span>
                  <span className="text-muted-foreground">{t('from')} Rp {cat.limitAmount.toLocaleString('id-ID')}</span>
                </div>
                <div className="h-3 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${percent}%` }} />
                </div>
              </div>

              {/* AI TIP UNTUK BUDGET */}
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 shadow-inner">
                 <p className="text-[11px] font-medium text-foreground/80 leading-relaxed italic">
                   {getBudgetAITip(language, cat.name, cat.period || 'monthly', percent, isOver)}
                 </p>
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={!!optionsCatId} onOpenChange={(open) => !open && setOptionsCatId(null)}>
        <DialogContent className="sm:max-w-[300px] w-[80vw] rounded-3xl p-6 bg-card border border-border shadow-2xl [&>button.absolute]:hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-center text-foreground">Opsi Kategori</DialogTitle>
            <DialogDescription className="sr-only">Pilih aksi untuk kategori</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            <button onClick={() => { 
               const cat = categories.find(c => c.id === optionsCatId); 
               setOptionsCatId(null); 
               if(cat) openModal(cat); 
            }} className="w-full h-12 bg-muted text-foreground font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-border transition-colors">
              <Pencil size={16} /> {t('editCategory')}
            </button>
            <button onClick={() => { 
               setDeleteConfirmId(optionsCatId); 
               setOptionsCatId(null); 
            }} className="w-full h-12 bg-rose-500/10 text-rose-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-colors">
              <Trash2 size={16} /> {t('delete')}
            </button>
            <button onClick={() => setOptionsCatId(null)} className="w-full h-12 bg-transparent text-muted-foreground font-bold rounded-xl hover:bg-muted transition-colors mt-2">
              {t('cancel')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmModal 
        isOpen={!!deleteConfirmId} 
        onClose={() => setDeleteConfirmId(null)} 
        onConfirm={() => { if(deleteConfirmId) deleteCategory(deleteConfirmId); }} 
        title={t('deleteCatTitle')} 
        message={t('deleteCatMsg')} 
        confirmText={t('delete')} 
      />
    </div>
  );
}