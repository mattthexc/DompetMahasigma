'use client';

import { useAppStore, Transaction, Debt } from '@/store/useAppStore';
import { ArrowDown, ArrowUp, HandCoins, Handshake, ReceiptText, Trash2, Download, Target, CalendarDays, Tag, Info, CheckCircle2, MoreHorizontal, Filter, ChevronDown, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { id as localeId, enUS as localeEn } from 'date-fns/locale';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ConfirmModal } from '@/components/CustomUI';
import { useTranslation, translateCategory } from '@/lib/i18n';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function TransactionsPage() {
  const { t, language } = useTranslation();
  const dateLocale = language === 'id' ? localeId : localeEn;
  const { transactions, deleteTransaction, debts, payDebt, deleteDebt } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'debts'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [confirmDeleteDebt, setConfirmDeleteDebt] = useState<string | null>(null);
  const [optionsDebtId, setOptionsDebtId] = useState<string | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const exportCSV = () => {
    if (transactions.length === 0) {
      alert("Tidak ada transaksi untuk diunduh.");
      return;
    }

    // Summary Data
    const totalIncome = transactions.filter(t => t.type === 'income' || t.type === 'debt_borrow').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense' || t.type === 'debt_lend' || t.type === 'saving').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    let csvContent = `Dompet Mahasigma - e-Statement Resmi\n`;
    csvContent += `Tanggal Cetak:,${format(new Date(), 'dd/MM/yyyy HH:mm')}\n\n`;
    csvContent += `RINGKASAN KEUANGAN\n`;
    csvContent += `Total Pemasukan:,Rp ${totalIncome}\n`;
    csvContent += `Total Pengeluaran:,Rp ${totalExpense}\n`;
    csvContent += `Saldo Akhir:,Rp ${balance}\n\n`;

    // Header CSV
    csvContent += `${t('date')},${t('type')},${t('category')},${t('desc')},${t('nominal')}\n`;

    // Isi data CSV
    transactions.forEach(tx => {
      const date = tx.date ? format(new Date(tx.date), 'dd/MM/yyyy HH:mm') : '-';
      const typeStr = tx.type === 'income' ? t('income') :
        tx.type === 'expense' ? t('expense') :
          tx.type === 'debt_borrow' ? t('borrow') :
            tx.type === 'debt_lend' ? t('lend') : t('goals');
      // Tambahkan quotes agar jika ada koma di title tidak merusak CSV
      const row = `"${date}","${typeStr}","${translateCategory(tx.category, language)}","${tx.title.replace(/"/g, '""')}","${tx.amount}"`;
      csvContent += row + "\n";
    });

    // Buat file dan trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DompetMahasigma_e-Statement_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportModalOpen(false);
  };

  const exportPDF = () => {
    if (transactions.length === 0) {
      alert("Tidak ada transaksi untuk diunduh.");
      return;
    }
    const doc = new jsPDF();

    // Warna & Styling Dasar
    const primaryColor: [number, number, number] = [79, 70, 229]; // Indigo-600
    const textColor: [number, number, number] = [33, 33, 33];
    const grayColor: [number, number, number] = [100, 100, 100];

    // Header Kop Surat
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text('DOMPET MAHASIGMA', 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayColor);
    doc.text('e-Statement Resmi (Laporan Mutasi Keuangan)', 14, 28);
    doc.text(`Tanggal Cetak: ${format(new Date(), 'dd MMMM yyyy HH:mm', { locale: dateLocale })}`, 14, 33);

    // Garis Pemisah
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(14, 38, 196, 38);

    // Summary Saldo
    const totalIncome = transactions.filter(t => t.type === 'income' || t.type === 'debt_borrow').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense' || t.type === 'debt_lend' || t.type === 'saving').reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpense;

    // Kotak Summary
    doc.setFillColor(249, 250, 251); // Gray-50
    doc.roundedRect(14, 42, 182, 25, 3, 3, "F");

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont("helvetica", "bold");
    doc.text('Total Pemasukan', 20, 50);
    doc.text('Total Pengeluaran', 80, 50);
    doc.text('Saldo Akhir', 140, 50);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text(`Rp ${totalIncome.toLocaleString('id-ID')}`, 20, 58);

    doc.setTextColor(244, 63, 94); // Rose-500
    doc.text(`Rp ${totalExpense.toLocaleString('id-ID')}`, 80, 58);

    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text(`Rp ${balance.toLocaleString('id-ID')}`, 140, 58);

    // Tabel Transaksi
    const tableData = transactions.map(tx => [
      tx.date ? format(new Date(tx.date), 'dd/MM/yyyy HH:mm') : '-',
      tx.title,
      translateCategory(tx.category, language),
      tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : tx.type === 'saving' ? 'Tabungan' : tx.type === 'debt_borrow' ? 'Hutang Masuk' : 'Piutang Keluar',
      `Rp ${tx.amount.toLocaleString('id-ID')}`
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Tanggal', 'Keterangan', 'Kategori', 'Tipe', 'Nominal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 4, textColor: textColor },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' }
      }
    });

    doc.save(`DompetMahasigma_e-Statement_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
    setIsExportModalOpen(false);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    if (filter === 'income') return tx.type === 'income' || tx.type === 'debt_borrow';
    if (filter === 'expense') return tx.type === 'expense' || tx.type === 'debt_lend' || tx.type === 'saving';
    return true;
  });

  return (
    <div className="pb-24">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 pt-8 pb-4 flex justify-between items-center mt-0">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{t('transactions')}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Tombol Unduh e-Statement */}
          <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-3 py-2.5 bg-primary/10 text-primary border border-transparent rounded-xl text-xs font-bold hover:bg-primary/20 transition-colors active:scale-95 shadow-sm" title="Unduh e-Statement">
            <Download size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Unduh</span>
          </button>

          {/* Dropdown Filter */}
          <div className="relative">
            <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-3 py-2.5 bg-card border border-border text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-colors active:scale-95 shadow-sm">
              <Filter size={16} />
              <span className="hidden sm:inline">
                {filter === 'all' ? t('all') : filter === 'income' ? t('income') : filter === 'expense' ? t('expense') : 'Dosa Teman'}
              </span>
              <ChevronDown size={14} className={isFilterOpen ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-2xl shadow-xl z-50 p-2 flex flex-col gap-1 overflow-hidden">
                  {['all', 'income', 'expense', 'debts'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => { setFilter(tab as any); setIsFilterOpen(false); }}
                      className={cn("w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-colors", filter === tab ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")}
                    >
                      {tab === 'all' ? t('all') : tab === 'income' ? t('income') : tab === 'expense' ? t('expense') : 'Dosa Teman'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4 pt-4">
        {filter === 'debts' ? (
          (!debts || debts.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center"><Handshake size={32} /></div>
              <p className="text-sm font-bold text-muted-foreground">Belum ada catatan hutang teman.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(debts || []).map((debt) => (
                <div key={debt.id} className={`group flex items-center justify-between p-4 bg-card rounded-2xl border ${debt.isPaid ? 'border-emerald-500/30' : 'border-border'} shadow-sm transition-all`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 shadow-inner ${debt.isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      <Handshake size={24} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-base leading-tight truncate flex items-center gap-2">
                        {debt.borrowerName}
                        {debt.isPaid && <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[9px] font-black uppercase">Lunas</span>}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{debt.date ? format(new Date(debt.date), 'dd MMM yyyy', { locale: dateLocale }) : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <div className={`font-black text-right ${debt.isPaid ? 'text-muted-foreground line-through' : 'text-rose-500'}`}>
                      Rp {debt.amount.toLocaleString('id-ID')}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setOptionsDebtId(debt.id); }} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary transition-colors ml-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center"><ReceiptText size={32} /></div>
            <p className="text-sm font-bold text-muted-foreground">{t('emptyTx')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {

              // LOGIKA DESAIN WARNA KHUSUS UNTUK TIAP TIPE TRANSAKSI
              let bgColor = "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
              let amountColor = "text-emerald-600 dark:text-emerald-400";
              let sign = "+";
              let Icon = ArrowUp;

              if (tx.type === 'expense') {
                bgColor = "bg-rose-500/15 text-rose-600 dark:text-rose-400";
                amountColor = "text-rose-600 dark:text-rose-400";
                sign = "-";
                Icon = ArrowDown;
              } else if (tx.type === 'debt_lend') {
                bgColor = "bg-rose-500/15 text-rose-600 dark:text-rose-400";
                amountColor = "text-rose-600 dark:text-rose-400";
                sign = "-";
                Icon = Handshake;
              } else if (tx.type === 'debt_borrow') {
                bgColor = "bg-amber-500/15 text-amber-600 dark:text-amber-400";
                amountColor = "text-amber-600 dark:text-amber-400";
                sign = "+";
                Icon = HandCoins;
              } else if (tx.type === 'saving') {
                bgColor = "bg-sky-500/15 text-sky-600 dark:text-sky-400"; // Warna Biru Langit Khusus Tabungan
                amountColor = "text-sky-600 dark:text-sky-400";
                sign = "-";
                Icon = Target; // Ikon Target untuk tabungan
              }

              let displayTitle = tx.title;
              if (tx.type === 'debt_borrow' && !displayTitle.toLowerCase().startsWith('ngutang')) {
                displayTitle = `Ngutang: ${displayTitle}`;
              }

              return (
                <div key={tx.id} onClick={() => setSelectedTx(tx)} className="group cursor-pointer flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4 min-w-0">

                    {/* Ikon Dinamis Berdasarkan Warna */}
                    <div className={`flex items-center justify-center w-12 h-12 rounded-2xl shrink-0 shadow-inner ${bgColor}`}>
                      <Icon size={24} strokeWidth={2.5} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-base leading-tight truncate">{displayTitle}</h3>
                      <p className="text-xs font-medium text-muted-foreground mt-1 truncate">{tx.date ? format(new Date(tx.date), 'dd MMM', { locale: dateLocale }) : ''} • {translateCategory(tx.category, language)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    {/* Angka Dinamis Berdasarkan Warna */}
                    <div className={`font-black text-right ${amountColor}`}>
                      {sign} Rp {tx.amount.toLocaleString('id-ID')}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmDelete(tx.id); }} className="p-2 text-muted-foreground hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => { if (confirmDelete) deleteTransaction(confirmDelete); }}
        title={t('deleteTx')}
        message={t('deleteTxMsg')}
      />

      <ConfirmModal
        isOpen={!!confirmDeleteDebt}
        onClose={() => setConfirmDeleteDebt(null)}
        onConfirm={() => { if (confirmDeleteDebt) deleteDebt(confirmDeleteDebt); }}
        title="Hapus Catatan Hutang"
        message="Apakah Anda yakin ingin menghapus catatan hutang ini? (Hanya menghapus catatan, tidak mengembalikan saldo)"
      />

      <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
        <DialogContent className="sm:max-w-[320px] w-[85vw] rounded-3xl p-6 bg-card border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-center text-foreground">Unduh e-Statement</DialogTitle>
            <DialogDescription className="text-center text-xs mt-1">Laporan mutasi keuangan standar industri. Pilih format dokumen:</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button onClick={exportPDF} className="w-full h-14 bg-indigo-500/10 text-indigo-600 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-500 hover:text-white transition-all shadow-sm">
              <FileText size={20} /> Format PDF Resmi
            </button>
            <button onClick={exportCSV} className="w-full h-14 bg-emerald-500/10 text-emerald-600 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
              <FileSpreadsheet size={20} /> Format CSV (Excel)
            </button>
            <button onClick={() => setIsExportModalOpen(false)} className="w-full h-12 bg-transparent text-muted-foreground font-bold rounded-xl hover:bg-muted transition-colors mt-2">
              Batal
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!optionsDebtId} onOpenChange={(open) => !open && setOptionsDebtId(null)}>
        <DialogContent className="sm:max-w-[300px] w-[80vw] rounded-3xl p-6 bg-card border border-border shadow-2xl [&>button.absolute]:hidden">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-center text-foreground">Opsi Dosa Teman</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-2">
            {optionsDebtId && debts.find(d => d.id === optionsDebtId)?.isPaid === false && (
              <button onClick={() => {
                payDebt(optionsDebtId);
                setOptionsDebtId(null);
              }} className="w-full h-12 bg-emerald-500/10 text-emerald-600 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-500 hover:text-white transition-colors">
                <CheckCircle2 size={16} /> Tandai Lunas
              </button>
            )}
            <button onClick={() => {
              setConfirmDeleteDebt(optionsDebtId);
              setOptionsDebtId(null);
            }} className="w-full h-12 bg-rose-500/10 text-rose-500 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-colors">
              <Trash2 size={16} /> Hapus Catatan
            </button>
            <button onClick={() => setOptionsDebtId(null)} className="w-full h-12 bg-transparent text-muted-foreground font-bold rounded-xl hover:bg-muted transition-colors mt-2">
              Batal
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedTx} onOpenChange={(open) => { if (!open) setSelectedTx(null); }}>
        <DialogContent className="sm:max-w-md w-[92vw] rounded-3xl p-6 bg-card border border-border shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-black tracking-tight text-foreground">{t('detailTx')}</DialogTitle></DialogHeader>
          {selectedTx && (
            <div className="space-y-4 mt-2">
              <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-2xl border border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{t('nominal')}</span>
                <span className={`text-4xl font-black mt-1 ${selectedTx.type === 'expense' || selectedTx.type === 'debt_lend' || selectedTx.type === 'saving' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  Rp {selectedTx.amount.toLocaleString('id-ID')}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <div className="flex items-center gap-3 text-muted-foreground"><CalendarDays size={18} /> <span className="text-sm font-bold">{t('date')}</span></div>
                  <span className="text-sm font-bold text-foreground">{selectedTx.date ? format(new Date(selectedTx.date), 'dd MMMM yyyy, HH:mm', { locale: dateLocale }) : '-'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <div className="flex items-center gap-3 text-muted-foreground"><Tag size={18} /> <span className="text-sm font-bold">{t('category')}</span></div>
                  <span className="text-sm font-bold text-foreground">{translateCategory(selectedTx.category, language)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <div className="flex items-center gap-3 text-muted-foreground"><Info size={18} /> <span className="text-sm font-bold">{t('desc')}</span></div>
                  <span className="text-sm font-bold text-foreground truncate max-w-[50%]">{selectedTx.title}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                  <div className="flex items-center gap-3 text-muted-foreground"><ReceiptText size={18} /> <span className="text-sm font-bold">{t('type')}</span></div>
                  <span className="text-sm font-bold text-foreground">
                    {selectedTx.type === 'income' ? t('income') : selectedTx.type === 'expense' ? t('expense') : selectedTx.type === 'saving' ? t('goals') : selectedTx.type === 'debt_borrow' ? t('borrow') : t('lend')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}