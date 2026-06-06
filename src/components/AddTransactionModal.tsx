'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore, TransactionType } from '@/store/useAppStore';
import { ArrowDownRight, ArrowUpRight, HandCoins, Handshake, ChevronDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlertModal } from '@/components/CustomUI';
import { CustomSelect } from '@/components/CustomSelect';

interface ModalProps { trigger: React.ReactNode; initialType: TransactionType; }

export default function AddTransactionModal({ trigger, initialType }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { addTransaction, categories } = useAppStore();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState(categories[0]?.name || 'Umum');

  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', isError: false });

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); 
    if (!rawValue) { setAmount(''); return; }
    setAmount(new Intl.NumberFormat('id-ID').format(parseInt(rawValue, 10)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseInt(amount.replace(/\./g, ''), 10);
    if (!title || !parsedAmount) return;

    const finalCategory = (type === 'debt_borrow' || type === 'debt_lend') ? 'Catatan Utang' : category;
    const success = addTransaction({ title, amount: parsedAmount, type, category: finalCategory, date: new Date().toISOString() });

    if (success) { 
      setIsOpen(false); 
      setTitle(''); 
      setAmount(''); 
      setAlertData({ isOpen: true, title: 'Tercatat!', message: `Transaksi "${title}" sebesar Rp ${parsedAmount.toLocaleString('id-ID')} berhasil disimpan.`, isError: false });
    } else { 
      setAlertData({ isOpen: true, title: 'Saldo Kurang', message: 'Saldo utama kamu tidak mencukupi untuk melakukan transaksi keluar sebesar ini.', isError: true });
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); setType(initialType); }}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px] w-[92vw] rounded-3xl p-6 bg-card border border-border shadow-2xl overflow-hidden">
          <DialogHeader><DialogTitle className="text-xl font-black tracking-tight text-foreground">Catat Arus Kas</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-5 mt-4 w-full min-w-0">
            <div className="grid grid-cols-2 gap-3 w-full">
              <button type="button" onClick={() => setType('expense')} className={cn("h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all", type === 'expense' ? "border-rose-500 bg-rose-500/10 text-rose-500" : "border-border text-muted-foreground")}><ArrowDownRight size={18} /> Keluar</button>
              <button type="button" onClick={() => setType('income')} className={cn("h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all", type === 'income' ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-border text-muted-foreground")}><ArrowUpRight size={18} /> Masuk</button>
              <button type="button" onClick={() => setType('debt_borrow')} className={cn("h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all", type === 'debt_borrow' ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-border text-muted-foreground")}><HandCoins size={18} /> Ngutang (+)</button>
              <button type="button" onClick={() => setType('debt_lend')} className={cn("h-12 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all", type === 'debt_lend' ? "border-indigo-500 bg-indigo-500/10 text-indigo-500" : "border-border text-muted-foreground")}><Handshake size={18} /> Diutangin (-)</button>
            </div>
            {type === 'debt_borrow' && (<div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-3 rounded-xl text-xs font-bold flex gap-2.5 items-start"><Info size={16} className="shrink-0 mt-0.5" /><p>Uang masuk ke dompetmu dari hasil meminjam. Saldo bertambah, tapi ingat harus dikembalikan!</p></div>)}
            {type === 'debt_lend' && (<div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 p-3 rounded-xl text-xs font-bold flex gap-2.5 items-start"><Info size={16} className="shrink-0 mt-0.5" /><p>Uang keluar dari dompetmu untuk dipinjamkan ke orang lain. Saldo akan berkurang.</p></div>)}
            <div className="space-y-1.5 w-full">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nominal (Rp)</label>
              <Input type="text" inputMode="numeric" onChange={handleAmountChange} placeholder="0" required value={amount} className="h-12 w-full text-xl font-black rounded-xl px-4 bg-background border border-border focus-visible:border-primary" />
            </div>
            <div className="space-y-1.5 w-full">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{type === 'debt_borrow' ? 'Kamu Ngutang Ke Siapa?' : type === 'debt_lend' ? 'Siapa Yang Ngutang Ke Kamu?' : 'Keterangan'}</label>
              <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={type === 'debt_borrow' ? "Cth: Pinjam ke Budi" : type === 'debt_lend' ? "Cth: Asep pinjam uang" : "Cth: Makan Siang"} className="h-12 w-full rounded-xl px-4 bg-background border border-border font-medium" required />
            </div>
            {!type.includes('debt') && (
              <div className="space-y-1.5 w-full min-w-0">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pilih Kategori</label>
                <CustomSelect
                  value={category}
                  onChange={setCategory}
                  options={categories.map((cat) => ({ value: cat.name, label: <span className="flex items-center gap-2">{cat.icon} {cat.name}</span> }))}
                  title="Pilih Kategori"
                />
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-12 rounded-xl font-bold border-border text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setIsOpen(false)}>Batal</Button>
              <Button className="flex-1 h-12 rounded-xl text-base font-bold shadow-sm" type="submit">Simpan</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertModal isOpen={alertData.isOpen} onClose={() => setAlertData({ ...alertData, isOpen: false })} title={alertData.title} message={alertData.message} isError={alertData.isError} />
    </>
  );
}