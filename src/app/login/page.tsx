'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Wallet, ArrowRight, ShieldCheck, Loader2, AlertCircle, MailCheck, Eye, EyeOff } from 'lucide-react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCloud, isLoggedIn } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerificationPending, setIsVerificationPending] = useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMounted(true);
    setHydrated(useAppStore.persist.hasHydrated());
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    // Only auto-redirect if we are sure they are logged in and not in the middle of login processing
    if (mounted && hydrated && isLoggedIn && !isLoading && !isProcessingLogin) {
      if (useAppStore.getState().user?.name !== 'Sigma' && useAppStore.getState().user?.name) {
        router.replace('/dashboard');
      }
    }
  }, [mounted, hydrated, isLoggedIn, isLoading, isProcessingLogin, router]);

  if (!mounted || !hydrated) return null;

  const checkVerification = async () => {
    if (!auth.currentUser) return;
    setIsLoading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        await auth.signOut();
        setIsVerificationPending(false);
        setIsRegistering(false);
        setAlertMessage("SUCCESS:Verifikasi Berhasil! ✨ Silakan login dengan akun yang baru saja Anda buat.");
      } else {
        setAlertMessage("Email belum terverifikasi. Silakan cek folder Inbox/Spam Anda dan klik tautan dari kami.");
      }
    } catch (error) {
      setAlertMessage("Gagal mengecek status verifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!auth.currentUser) return;
    try {
      await sendEmailVerification(auth.currentUser);
      setAlertMessage("Tautan verifikasi telah dikirim ulang ke email Anda.");
    } catch (error) {
      setAlertMessage("Tunggu beberapa saat sebelum mengirim ulang.");
    }
  };

  const processLoginSuccess = async (user: any) => {
    setIsProcessingLogin(true);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const financeDoc = await getDoc(doc(db, 'users', user.uid, 'data', 'finance'));
    const chatDoc = await getDoc(doc(db, 'users', user.uid, 'data', 'chats'));

    let hdPhotoUrl = user.photoURL || '';
    if (hdPhotoUrl) hdPhotoUrl = hdPhotoUrl.replace(/=s\d+-c/g, '=s400-c');

    if (userDoc.exists()) {
      const profileData = userDoc.data().profile;
      const financeData = financeDoc.exists() ? financeDoc.data() : {};
      const chatData = chatDoc.exists() ? chatDoc.data() : {};

      if (!profileData || profileData.name === 'Sigma') {
        loginWithCloud(user.uid, {
          user: { ...useAppStore.getState().user, name: user.displayName || 'Mahasiswa Baru', email: user.email || '', avatarUrl: hdPhotoUrl }
        });
        router.push('/onboarding');
        return;
      }

      loginWithCloud(user.uid, {
        user: { ...profileData, email: user.email || profileData.email || '' },
        balance: financeData.balance || 0,
        transactions: financeData.transactions || [],
        categories: financeData.categories || useAppStore.getState().categories,
        goals: financeData.goals || [],
        chatMessages: chatData.messages || [],
        debts: financeData.debts || [],
        notifications: financeData.notifications || [],
        language: userDoc.data().language || 'id',
      });
      router.push('/dashboard');
    } else {
      loginWithCloud(user.uid, {
        user: { ...useAppStore.getState().user, name: user.displayName || 'Mahasiswa Baru', email: user.email || '', avatarUrl: hdPhotoUrl }
      });
      router.push('/onboarding');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegistering) {
      if (!name || !email || !password) {
        setAlertMessage("Nama lengkap, email, dan password wajib diisi.");
        return;
      }
      setIsLoading(true);
      try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName: name });
        await sendEmailVerification(result.user);
        setIsVerificationPending(true);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') setAlertMessage("Email sudah terdaftar. Silakan masuk.");
        else if (error.code === 'auth/weak-password') setAlertMessage("Password terlalu lemah (minimal 6 karakter).");
        else if (error.code === 'auth/invalid-email') setAlertMessage("Format email tidak valid.");
        else setAlertMessage("Terjadi kesalahan saat mendaftar: " + error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!email || !password) {
        setAlertMessage("Email dan password wajib diisi.");
        return;
      }
      setIsLoading(true);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (!result.user.emailVerified) {
          setIsVerificationPending(true);
          setIsLoading(false);
          return;
        }
        await processLoginSuccess(result.user);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') setAlertMessage("Email tidak terdaftar atau password salah.");
        else if (error.code === 'auth/invalid-email') setAlertMessage("Format email tidak valid.");
        else setAlertMessage("Gagal masuk. Periksa kembali email dan password Anda.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await processLoginSuccess(result.user);
    } catch (error: any) {
      console.error("Google Login Error:", error);
      setAlertMessage("Gagal masuk! Pastikan koneksi aman dan popup tidak diblokir.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-background relative overflow-hidden px-6">
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm mx-auto space-y-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/30 rotate-3 transition-transform hover:rotate-0"><Wallet size={40} strokeWidth={2.5} /></div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">DOMPET<br />MAHASIGMA</h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 flex items-center justify-center gap-1"><ShieldCheck size={14} /> Financial Companion</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-3xl p-6 shadow-2xl shadow-black/5 space-y-6">
          {isVerificationPending ? (
            <div className="flex flex-col items-center text-center space-y-6 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
                <MailCheck size={40} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Verifikasi Email</h3>
                <p className="text-sm font-medium text-muted-foreground">
                  Tautan verifikasi telah dikirim ke <br /><span className="text-foreground font-bold">{email}</span>.
                  <br /><br />Silakan cek Inbox atau folder Spam Anda, lalu klik tautan tersebut untuk melanjutkan.
                </p>
              </div>
              <div className="w-full space-y-3">
                <button type="button" onClick={checkVerification} disabled={isLoading} className="w-full h-14 bg-primary text-primary-foreground text-lg font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Saya Sudah Verifikasi"}
                </button>
                <button type="button" onClick={resendVerification} className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  Kirim Ulang Tautan
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* TAB SWITCHER */}
              <div className="flex p-1 bg-muted rounded-xl w-full">
                <button type="button" onClick={() => setIsRegistering(false)} className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${!isRegistering ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Masuk</button>
                <button type="button" onClick={() => setIsRegistering(true)} className={`flex-1 h-10 rounded-lg text-xs font-bold transition-all ${isRegistering ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Daftar Akun</button>
              </div>

              <button type="button" onClick={handleGoogleLogin} disabled={isLoading} className="w-full h-12 bg-background border border-border rounded-xl flex items-center justify-center gap-3 text-sm font-bold text-foreground hover:bg-muted transition-all shadow-sm active:scale-95 disabled:opacity-70">
                {isLoading ? <Loader2 size={20} className="animate-spin text-primary" /> : (
                  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" /><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" /><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" /><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 41.939 C -8.804 40.009 -11.514 38.989 -14.754 38.989 C -19.444 38.989 -23.494 41.689 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" /></g></svg>
                )}
                {isLoading ? 'Membaca Cloud...' : 'Lanjut dengan Google'}
              </button>

              <div className="flex items-center gap-3"><div className="h-px flex-1 bg-border"></div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Atau via Email</span><div className="h-px flex-1 bg-border"></div></div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div className="space-y-1.5"><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nama Lengkap</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama Mahasiswa" className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm font-bold text-foreground focus:border-primary focus:outline-none" /></div>
                )}
                <div className="space-y-1.5"><label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Mahasiswa</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@student.itera.ac.id" className="w-full h-12 bg-background border border-border rounded-xl px-4 text-sm font-bold text-foreground focus:border-primary focus:outline-none" /></div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full h-12 bg-background border border-border rounded-xl pl-4 pr-12 text-sm font-bold text-foreground focus:border-primary focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" className="w-full h-14 bg-primary text-primary-foreground text-lg font-bold rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">{isRegistering ? 'Daftar Sekarang' : 'Masuk Sekarang'} <ArrowRight size={20} /></button>
              </form>
            </>
          )}
        </div>
      </div>
      {/* Custom Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border shadow-2xl rounded-2xl p-6 max-w-sm w-full space-y-4 animate-in zoom-in-95 duration-200">
            <div className={`flex items-center gap-3 ${alertMessage.startsWith('SUCCESS:') ? 'text-emerald-500' : 'text-destructive'}`}>
              <AlertCircle size={24} />
              <h3 className="font-bold text-lg text-foreground">{alertMessage.startsWith('SUCCESS:') ? 'Berhasil' : 'Perhatian'}</h3>
            </div>
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {alertMessage.replace('SUCCESS:', '')}
            </p>
            <button
              onClick={() => setAlertMessage(null)}
              className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity active:scale-95"
            >
              {alertMessage.startsWith('SUCCESS:') ? 'Lanjutkan Login' : 'Mengerti'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}