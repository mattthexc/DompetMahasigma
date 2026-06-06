'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SelectOption {
  value: string;
  label: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  disabled?: boolean;
}

export function CustomSelect({ value, onChange, options, placeholder = 'Pilih salah satu', title = 'Pilih Opsi', disabled }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className="w-full h-12 rounded-xl px-4 bg-background border border-border flex items-center justify-between focus:outline-none focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed text-foreground shadow-sm"
        >
          <span className={selectedOption ? 'font-bold' : 'text-muted-foreground font-medium'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="text-muted-foreground" size={18} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md w-full rounded-t-[2.5rem] sm:rounded-3xl p-6 pb-8 bg-card border-t border-border shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col max-h-[85vh] fixed bottom-0 sm:relative sm:bottom-auto mb-0 mx-0 inset-x-0 data-[state=closed]:slide-out-to-bottom-[100%] data-[state=open]:slide-in-from-bottom-[100%] transition-transform duration-300">
        <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4 sm:hidden" />
        <DialogHeader className="mb-2 text-center sm:text-left">
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2 py-2 scrollbar-hide">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                className={`w-full p-4 rounded-xl flex items-center justify-between text-left transition-all ${
                  isSelected 
                    ? 'bg-primary/10 border border-primary/20 text-primary' 
                    : 'bg-muted/50 border border-transparent hover:bg-muted text-foreground'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                <span className="font-bold flex items-center gap-2">{option.label}</span>
                {isSelected && <Check size={18} className="text-primary" />}
              </button>
            );
          })}
        </div>

        <div className="pt-4 mt-2">
          <Button type="button" className="w-full h-14 rounded-2xl font-black text-base bg-muted text-foreground hover:bg-border transition-all shadow-none" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
