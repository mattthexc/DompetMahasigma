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
      <DialogContent className="sm:max-w-md w-[92vw] rounded-3xl p-6 bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-black tracking-tight text-foreground">{title}</DialogTitle>
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

        <div className="pt-4 border-t border-border mt-2">
          <Button type="button" variant="outline" className="w-full h-12 rounded-xl font-bold border-border text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
