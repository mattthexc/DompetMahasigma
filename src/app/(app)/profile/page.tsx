'use client';

import { useAppStore, AllowancePeriod } from '@/store/useAppStore';
import { User, LogOut, ChevronLeft, Save, Moon, Sun, Bell, Camera, ShieldAlert, Edit2, Wallet, Settings2, GraduationCap, Globe, Heart, Type, Minus, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { CustomDatePicker, AlertModal, ConfirmModal } from '@/components/CustomUI';
import { CustomSelect } from '@/components/CustomSelect';
import { useTranslation } from '@/lib/i18n';

const SUMBER_DANA = ["Orang Tua", "Beasiswa", "Gaji Part-Time / Freelance", "Lainnya"];

export default function ProfilePage() {
  const { t, language } = useTranslation();
  const { user, updateUser, resetData, theme, setTheme, logout, setLanguage, fontSize, setFontSize } = useAppStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [name, setName] = useState(user.name);
  const [campus, setCampus] = useState(user.campus || '');
  
  // State Modal Keuangan
  const [allowance, setAllowance] = useState(new Intl.NumberFormat('id-ID').format(user.allowanceAmount));
  const [period, setPeriod] = useState<AllowancePeriod>(user.allowancePeriod || 'monthly');
  const [incomeSource, setIncomeSource] = useState(user.incomeSource || SUMBER_DANA[0]);
  const [allowanceDate, setAllowanceDate] = useState(user.allowanceDate || '');

  const [isEditingName, setIsEditingName] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'logout' | 'reset' | null>(null);
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', isError: false });
  const [maxFontSize, setMaxFontSize] = useState(20);

  useEffect(() => {
    const calcMaxFontSize = () => {
      // Logic menyesuaikan resolusi layar HP dengan batas maksimal lebar container (448px)
      const maxWidth = Math.min(window.innerWidth, 448);
      const calculatedMax = Math.floor(maxWidth / 20);
      setMaxFontSize(Math.min(24, Math.max(18, calculatedMax)));
    };
    calcMaxFontSize();
    window.addEventListener('resize', calcMaxFontSize);
    return () => window.removeEventListener('resize', calcMaxFontSize);
  }, []);

  const handleSaveAllowance = () => {
    updateUser({ 
      allowanceAmount: parseInt(allowance.replace(/\./g, ''), 10) || 0, 
      allowancePeriod: period,
      incomeSource,
      allowanceDate
    });
    setIsModalOpen(false);
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      setAlertData({ isOpen: true, title: 'Gagal', message: 'Nama tidak boleh kosong!', isError: true });
      return;
    }
    updateUser({ name, campus });
    setIsEditingName(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 400; 
      let width = img.width; 
      let height = img.height;

      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }

      canvas.width = width; 
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      updateUser({ avatarUrl: dataUrl });
    };
    img.src = URL.createObjectURL(file);
  };

  const executeConfirmAction = () => {
    if (confirmAction === 'logout') { logout(); router.push('/login'); } 
    else if (confirmAction === 'reset') { resetData(); router.push('/login'); }
  };

  const periodSuffix = { weekly: t('weeklySuffix'), biweekly: t('biweeklySuffix'), monthly: t('monthlySuffix') };

  return (
    <div className="pb-6">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 pt-8 pb-4 flex items-center gap-4">
        <Link href="/dashboard" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-sm shrink-0"><ChevronLeft size={24} /></Link>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{t('settings')}</h1>
      </div>

      <div className="p-6 space-y-8 pt-4">
        <div className="flex flex-col items-center justify-center pt-2 space-y-3">
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center border-[3px] border-background shadow-md overflow-hidden transition-transform group-hover:scale-105">
            {user.avatarUrl ? <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <User size={40} strokeWidth={2} />}
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-primary-foreground rounded-full border-[3px] border-background flex items-center justify-center shadow-md"><Camera size={14} /></div>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
        </div>
        
        {isEditingName ? (
          <div className="flex flex-col items-center gap-3 w-full max-w-[250px] mt-2">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Lengkap" className="w-full h-10 bg-background border border-border rounded-xl px-4 font-bold text-center text-foreground focus:border-primary focus:outline-none shadow-sm" />
            <input type="text" value={campus} onChange={(e) => setCampus(e.target.value)} placeholder="Nama Kampus" className="w-full h-10 bg-background border border-border rounded-xl px-4 text-xs font-bold text-center text-foreground focus:border-primary focus:outline-none shadow-sm" />
            <button onClick={handleSaveProfile} className="w-full h-10 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"><Save size={16} /> Simpan Profil</button>
          </div>
        ) : (
          <div className="text-center group cursor-pointer mt-1" onClick={() => setIsEditingName(true)}>
            <h2 className="text-2xl font-extrabold text-foreground tracking-tight relative inline-block">
              {user.name} <Edit2 size={14} className="text-muted-foreground group-hover:text-primary transition-colors absolute -right-6 top-1/2 -translate-y-1/2 opacity-60 group-hover:opacity-100" />
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center justify-center gap-1"><GraduationCap size={12}/> {user.campus || 'Mahasiswa Sigma'}</p>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">{t('financeMgmt')}</h3>
        <div className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><Wallet size={24} /></div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{t('balanceTarget')}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-lg font-black text-foreground truncate">Rp {user.allowanceAmount.toLocaleString('id-ID')}</h3>
                  <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm border border-border">{periodSuffix[user.allowancePeriod || 'monthly']}</span>
                </div>
              </div>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild><button className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center hover:bg-border transition-colors shrink-0"><Settings2 size={18} /></button></DialogTrigger>
              <DialogContent className="sm:max-w-[400px] w-[90vw] max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-card border border-border shadow-2xl [&>button.absolute]:hidden scrollbar-hide">
                <DialogHeader>
                  <DialogTitle className="text-xl font-black text-foreground">{t('allowanceDetail')}</DialogTitle>
                  <DialogDescription className="sr-only">Atur batas dan sumber uang saku di sini.</DialogDescription>
                </DialogHeader>
                <div className="space-y-5 mt-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('incomeSourceLabel')}</label>
                    <CustomSelect
                      value={incomeSource}
                      onChange={setIncomeSource}
                      options={SUMBER_DANA.map(s => ({ value: s, label: s }))}
                      title={t('incomeSourceLabel')}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('routineAllowance')}</label>
                    <input type="text" inputMode="numeric" value={allowance} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setAllowance(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : ''); }} className="w-full h-12 bg-background border border-border rounded-xl px-4 font-black text-lg text-foreground focus:border-primary focus:outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('cycle')}</label>
                      <CustomSelect
                        value={period}
                        onChange={(v) => setPeriod(v as AllowancePeriod)}
                        options={[
                          { value: 'weekly', label: t('weekly') },
                          { value: 'biweekly', label: t('biweekly') },
                          { value: 'monthly', label: t('monthly') }
                        ]}
                        title={t('cycle')}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{t('estDate')}</label>
                      {/* FIX SIMETRIS: Memanggil prop className="h-12 text-xs" */}
                      <CustomDatePicker value={allowanceDate} onChange={setAllowanceDate} placeholder={t('selectDate')} className="h-12 text-xs" />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 h-12 bg-muted text-foreground font-bold rounded-xl hover:bg-border transition-colors">{t('cancel')}</button>
                    <button onClick={handleSaveAllowance} className="flex-1 h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">{t('save')}</button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-2">{t('appPref')}</h3>
        <div className="bg-card rounded-3xl border border-border overflow-hidden divide-y divide-border shadow-sm">
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500"><Globe size={20} /></div>
              <span className="font-bold text-sm text-foreground">{t('language')}</span>
            </div>
            <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-border">
              <button onClick={() => setLanguage('id')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'id' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>ID</button>
              <button onClick={() => setLanguage('en')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>EN</button>
            </div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
              </div>
              <span className="font-bold text-sm text-foreground">{t('theme')}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{theme === 'dark' ? t('theme_dark') : t('theme_light')}</span>
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={`w-14 h-8 rounded-full transition-colors relative shadow-inner ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-sm ${theme === 'dark' ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
          
          <Link href="/notifications" className="p-4 flex items-center justify-between hover:bg-muted transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform"><Bell size={20} /></div>
              <span className="font-bold text-sm text-foreground">{t('notifications')}</span>
            </div>
            <div className="text-muted-foreground group-hover:text-foreground transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
          </Link>
          <Dialog open={isFontModalOpen} onOpenChange={setIsFontModalOpen}>
            <DialogTrigger asChild>
              <button className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-105 transition-transform"><Type size={20} /></div>
                  <span className="font-bold text-sm text-foreground">Ukuran Font</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-1 rounded-md">{fontSize || 16}px</span>
                  <div className="text-muted-foreground group-hover:text-foreground transition-colors"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg></div>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-[92vw] rounded-3xl p-6 bg-card border border-border shadow-2xl overflow-hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-2 text-foreground">
                  <Type size={22} className="text-primary" /> Aksesibilitas Font
                </DialogTitle>
                <DialogDescription className="text-xs mt-1">Sesuaikan ukuran teks agar lebih nyaman dibaca.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between bg-muted/50 p-3 rounded-xl border border-border">
                  <span className="text-xs font-bold text-muted-foreground">Ukuran Saat Ini:</span>
                  <span className="text-xl font-black text-primary">{fontSize || 16}px</span>
                </div>
                
                <div className="flex items-center justify-between bg-background border border-border rounded-xl p-2 shadow-inner">
                  <button onClick={() => setFontSize(Math.max(12, (fontSize || 16) - 1))} className="w-14 h-14 bg-muted text-foreground rounded-xl flex items-center justify-center hover:bg-border transition-colors active:scale-95 shadow-sm">
                    <Minus size={24} strokeWidth={3} />
                  </button>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Pratinjau</span>
                    <span className="font-medium text-foreground transition-all duration-300" style={{ fontSize: `${fontSize || 16}px` }}>Aa</span>
                  </div>
                  <button onClick={() => setFontSize(Math.min(maxFontSize, (fontSize || 16) + 1))} className="w-14 h-14 bg-muted text-foreground rounded-xl flex items-center justify-center hover:bg-border transition-colors active:scale-95 shadow-sm">
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
                
                <div className="flex justify-between text-[10px] text-muted-foreground font-bold mt-1">
                  <span>Min: 12px</span>
                  <span>Maks: {maxFontSize}px</span>
                </div>

                <div className="pt-2">
                  <button onClick={() => setIsFontModalOpen(false)} className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all">{t('close')}</button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>

      <div className="space-y-3 pb-6">
        <h3 className="text-xs font-bold text-rose-500 uppercase tracking-wider ml-2">{t('sessionCloud')}</h3>
        <div className="bg-card rounded-3xl border border-border overflow-hidden divide-y divide-border shadow-sm">
          <button onClick={() => setConfirmAction('logout')} className="w-full p-4 flex items-center justify-between hover:bg-muted transition-colors text-left"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-foreground"><LogOut size={20} /></div><span className="font-bold text-foreground text-sm">{t('logout')}</span></div></button>
          <button onClick={() => setConfirmAction('reset')} className="w-full p-4 flex items-center justify-between hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-500"><ShieldAlert size={20} /></div><span className="font-bold text-rose-600 dark:text-rose-500 text-sm">{t('resetDb')}</span></div></button>
        </div>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-3xl p-5 flex flex-col items-center justify-center gap-3 text-center shadow-inner relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/20 rounded-full blur-md opacity-50"></div>
        <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-primary/20 rounded-full blur-md opacity-50"></div>
        <div className="w-12 h-12 bg-card rounded-2xl flex items-center justify-center shadow-sm border border-border z-10">
          <Heart size={24} className="fill-rose-500 text-rose-500 animate-pulse" />
        </div>
        <div className="z-10 mt-1">
          <h4 className="text-sm font-extrabold text-foreground">{t('supportDev')}</h4>
          <p className="text-[11px] font-medium text-muted-foreground mt-2 max-w-[250px] mx-auto leading-relaxed">
            {t('supportDesc1')} <a href="https://instagram.com/mattthexc" target="_blank" rel="noopener noreferrer" className="text-primary font-bold hover:underline">@mattthexc</a>
            <br/>
            {t('supportDesc2')}
          </p>
          <div className="mt-3 bg-background border border-border px-3 py-1.5 rounded-xl shadow-sm inline-flex items-center gap-2">
            <span className="font-black text-foreground tracking-widest text-sm">085173517654</span>
          </div>
        </div>
      </div>

      <ConfirmModal isOpen={!!confirmAction} onClose={() => setConfirmAction(null)} onConfirm={executeConfirmAction} title={confirmAction === 'logout' ? t('logoutConfirmTitle') : t('resetConfirmTitle')} message={confirmAction === 'logout' ? t('logoutConfirmDesc') : t('resetConfirmDesc')} confirmText={confirmAction === 'logout' ? t('yesLogout') : t('yesReset')} isDanger={true} />
      <AlertModal isOpen={alertData.isOpen} onClose={() => setAlertData({ ...alertData, isOpen: false })} title={alertData.title} message={alertData.message} isError={alertData.isError} />
      </div>
    </div>
  );
}