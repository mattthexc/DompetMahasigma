'use client';

import { format, addMonths, subMonths, addYears, subYears, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar, AlertTriangle, Info } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';

// PORTAL HELPER
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// 1. MODAL KONFIRMASI
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Hapus", isDanger = true }: any) {
  if (!isOpen) return null;
  return (
    <Portal>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
        <div className="w-full max-w-[360px] bg-card rounded-3xl p-6 border border-border shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex flex-col items-center text-center space-y-4 mt-2">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${isDanger ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'}`}>
              <AlertTriangle size={32} strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">{title}</h2>
              <p className="text-sm font-medium text-muted-foreground mt-2">{message}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={onClose} className="flex-1 h-12 rounded-xl bg-muted text-foreground font-bold hover:bg-border transition-colors">Batal</button>
            <button onClick={() => { onConfirm(); onClose(); }} className={`flex-1 h-12 rounded-xl font-bold text-white transition-all shadow-sm ${isDanger ? 'bg-rose-500 hover:opacity-90' : 'bg-primary hover:opacity-90'}`}>{confirmText}</button>
          </div>
        </div>
      </div>
    </Portal>
  );
}

// 2. MODAL ALERT
export function AlertModal({ isOpen, onClose, title, message, isError = true }: any) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[360px] w-[90vw] rounded-3xl p-6 bg-card border border-border shadow-2xl [&>button.absolute]:hidden z-[9999]">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{message}</DialogDescription>

        <div className="flex flex-col items-center text-center space-y-4 mt-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${isError ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {isError ? <AlertTriangle size={32} strokeWidth={2} /> : <Info size={32} strokeWidth={2} />}
          </div>
          <div>
            <h2 className="text-xl font-black text-foreground tracking-tight">{title}</h2>
            <p className="text-sm font-medium text-muted-foreground mt-2">{message}</p>
          </div>
        </div>
        
        <div className="w-full mt-6">
          <button onClick={onClose} className="w-full h-12 rounded-xl font-bold text-white transition-all shadow-sm bg-primary hover:opacity-90">Mengerti</button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 3. DATE PICKER CUSTOM (Dengan prop className agar bisa simetris)
export function CustomDatePicker({ value, onChange, placeholder = "Pilih Tanggal", className = "h-14" }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(value ? new Date(value) : new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSelect = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className={`w-full bg-background border border-border rounded-xl px-4 font-bold text-foreground focus:border-primary flex items-center justify-between transition-colors hover:bg-muted/50 uppercase ${className}`}>
        {value ? format(new Date(value), 'dd MMM yyyy', { locale: localeId }) : <span className="text-muted-foreground uppercase tracking-wider">{placeholder}</span>}
        <Calendar size={18} className="text-muted-foreground" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[340px] w-[90vw] rounded-3xl p-5 bg-card border border-border shadow-2xl [&>button.absolute]:hidden z-[9999]">
          <DialogTitle className="sr-only">Pilih Tanggal</DialogTitle>
          <DialogDescription className="sr-only">Navigasi kalender untuk memilih tenggat waktu</DialogDescription>
          
          <div className="flex justify-between items-center mb-4 mt-2">
            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 bg-muted hover:bg-border rounded-xl transition-colors"><ChevronLeft size={18}/></button>
            <span className="font-extrabold text-foreground tracking-tight text-sm uppercase">{format(currentMonth, 'MMMM', { locale: localeId })}</span>
            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 bg-muted hover:bg-border rounded-xl transition-colors"><ChevronRight size={18}/></button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">
            {['Min','Sen','Sel','Rab','Kam','Jum','Sab'].map(d => <div key={d}>{d}</div>)}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
            {days.map(day => {
              const isSelected = value && isSameDay(day, new Date(value));

              return (
                 <button 
                  key={day.toISOString()} 
                  type="button" 
                  onClick={() => handleSelect(day)} 
                  className={`h-10 w-full rounded-xl flex items-center justify-center text-sm font-bold transition-all 
                    ${isSelected ? 'bg-primary text-primary-foreground shadow-md scale-110' : 'text-foreground hover:bg-muted'}
                  `}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
          
          <div className="w-full mt-4 space-y-2">
            {value && (
              <button type="button" onClick={handleClear} className="w-full h-12 rounded-xl font-bold bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors">Hapus Tanggal</button>
            )}
            <button type="button" onClick={() => setIsOpen(false)} className="w-full h-12 rounded-xl font-bold bg-muted text-foreground hover:bg-border transition-colors">Batal</button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}