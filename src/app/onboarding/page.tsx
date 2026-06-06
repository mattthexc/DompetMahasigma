'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore, AllowancePeriod } from '@/store/useAppStore';
import { GraduationCap, ArrowRight, User, Wallet, CalendarDays } from 'lucide-react';
import { CustomDatePicker } from '@/components/CustomUI';
import { CustomSelect } from '@/components/CustomSelect';

const KAMPUS_LIST = ["Institut Teknologi Sumatera (ITERA)", "Universitas Indonesia (UI)", "Universitas Gadjah Mada (UGM)", "Institut Teknologi Bandung (ITB)", "Universitas Padjadjaran (UNPAD)", "Universitas Lampung (UNILA)", "Lainnya"];
const SUMBER_DANA = ["Orang Tua", "Beasiswa", "Gaji Part-Time / Freelance", "Lainnya"];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser, addTransaction } = useAppStore();
  
  // State Identitas
  const [campus, setCampus] = useState(KAMPUS_LIST[0]);
  
  // State Rutinitas (Jatah)
  const [incomeSource, setIncomeSource] = useState(SUMBER_DANA[0]);
  const [allowancePeriod, setAllowancePeriod] = useState<AllowancePeriod>('monthly');
  const [allowanceDate, setAllowanceDate] = useState('');
  const [allowanceAmount, setAllowanceAmount] = useState('');
  
  // State Saldo Riil Saat Ini
  const [initialBalance, setInitialBalance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAllowance = parseInt(allowanceAmount.replace(/\./g, ''), 10) || 0;
    const currentBalance = parseInt(initialBalance.replace(/\./g, ''), 10) || 0;

    // Simpan ke Profil User
    updateUser({ 
      name: user.name, // Menggunakan nama yang sudah diisi saat register
      campus, 
      incomeSource, 
      allowancePeriod, 
      allowanceDate, 
      allowanceAmount: targetAllowance 
    });

    // Masukkan Uang Riil ke Dompet
    if (currentBalance > 0) {
      addTransaction({
        title: 'Saldo Awal Dompet',
        amount: currentBalance,
        type: 'income',
        category: 'Umum',
        date: new Date().toISOString()
      });
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background relative overflow-y-auto px-6 py-12 scrollbar-hide">
      <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none fixed" />
      
      <div className="relative z-10 w-full max-w-sm mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
        
        <div className="text-center space-y-2 mt-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 text-primary border-4 border-background shadow-xl flex items-center justify-center overflow-hidden mb-4">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User size={40} />}
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Kenalan Dulu, Yuk!</h1>
          <p className="text-sm font-medium text-muted-foreground">Siapkan jurnal keuangan pertamamu.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: IDENTITAS */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-foreground border-b border-border pb-2 flex items-center gap-2"><User size={16}/> Profil Mahasiswa</h2>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Asal Kampus</label>
              <CustomSelect
                value={campus}
                onChange={setCampus}
                options={KAMPUS_LIST.map(k => ({ value: k, label: k }))}
                title="Pilih Kampus"
              />
            </div>
          </div>

          {/* SECTION 2: SIKLUS PENGHASILAN */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5">
            <h2 className="text-sm font-black text-foreground border-b border-border pb-2 flex items-center gap-2"><CalendarDays size={16}/> Info Uang Saku Rutin</h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Sumber Dana Utama</label>
              <CustomSelect
                value={incomeSource}
                onChange={setIncomeSource}
                options={SUMBER_DANA.map(s => ({ value: s, label: s }))}
                title="Pilih Sumber Dana"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Pemasukan Rutin (Rp)</label>
              <input type="text" inputMode="numeric" value={allowanceAmount} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setAllowanceAmount(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : ''); }} required placeholder="Cth: 1.500.000" className="w-full h-14 bg-background border border-border rounded-xl px-4 font-bold text-foreground focus:border-primary focus:outline-none transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Siklus Turun</label>
                <CustomSelect
                  value={allowancePeriod}
                  onChange={(v) => setAllowancePeriod(v as AllowancePeriod)}
                  options={[
                    { value: 'weekly', label: 'Mingguan' },
                    { value: 'biweekly', label: '2 Minggu' },
                    { value: 'monthly', label: 'Bulanan' }
                  ]}
                  title="Pilih Siklus"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Estimasi Tanggal</label>
                <CustomDatePicker value={allowanceDate} onChange={setAllowanceDate} placeholder="Pilih Tgl" className="h-14 text-xs" />
              </div>
            </div>
          </div>

          {/* SECTION 3: SALDO SAAT INI */}
          <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 shadow-inner space-y-3">
            <h2 className="text-sm font-black text-primary flex items-center gap-2"><Wallet size={16}/> Saldo Riil Saat Ini</h2>
            <p className="text-xs font-medium text-foreground/70">Uang yang benar-benar ada di dompet/rekeningmu detik ini.</p>
            <input type="text" inputMode="numeric" value={initialBalance} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setInitialBalance(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : ''); }} required placeholder="0" className="w-full h-14 bg-background border-2 border-primary/30 rounded-xl px-4 text-xl font-black text-foreground focus:border-primary focus:outline-none transition-colors text-center" />
          </div>

          <button type="submit" className="w-full h-14 bg-primary text-primary-foreground text-lg font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-4">
            Mulai Gunakan Dompet <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}