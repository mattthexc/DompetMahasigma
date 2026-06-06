'use client';

import BottomNav from "@/components/BottomNav";
import { useAppStore } from "@/store/useAppStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { AlertModal } from "@/components/CustomUI";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, theme, notifications, markNotificationRead, goals, addNotification, fontSize } = useAppStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [initialNotifShown, setInitialNotifShown] = useState(false);
  const [alertData, setAlertData] = useState({ isOpen: false, title: '', message: '', id: '' });
  const hasCheckedGoals = useRef(false);

  useEffect(() => {
    setMounted(true);
    setHydrated(useAppStore.persist.hasHydrated());
    const unsub = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (mounted && hydrated && !isLoggedIn) {
      router.replace('/login');
    }
  }, [mounted, hydrated, isLoggedIn, router]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!mounted) return;
    
    // Fungsi untuk auto-scale berdasarkan lebar device secara mulus
    const handleResize = () => {
      const width = window.innerWidth;
      const root = document.documentElement;
      
      // Asumsi desain ideal di layar lebar 390px dengan font dasar 16px.
      // Jika layar lebih kecil/besar, base font disesuaikan secara proporsional.
      // Kita batasi maksimum 448px (max-w-md di desain kita).
      const effectiveWidth = Math.min(width, 448);
      
      // Hitung proporsi font size
      let calculatedFontSize = (effectiveWidth / 390) * 16;
      
      // Batasi font size agar tidak terlalu kecil di HP lipat/jadul dan tidak terlalu besar
      calculatedFontSize = Math.max(12, Math.min(18, calculatedFontSize));
      
      root.style.fontSize = `${calculatedFontSize}px`;
      
      // Reset properti zoom ke standar, karena scaling pakai fontSize lebih stabil lintas browser
      root.style.setProperty('zoom', '1');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mounted]);

  useEffect(() => {
    if (mounted && isLoggedIn && !initialNotifShown) {
      
      // CEK KELALAIAN TABUNGAN (Sekali saja saat mount)
      if (!hasCheckedGoals.current && goals && goals.length > 0) {
        hasCheckedGoals.current = true;
        goals.forEach(g => {
          if (g.currentAmount < g.targetAmount) {
            // Logika sederhana: berikan pengingat motivasi jika saldo belum mencapai target
            const alreadyNotified = (notifications || []).some(n => n.type === 'goal' && n.title.includes(g.name) && !n.isRead);
            if (!alreadyNotified) {
              addNotification({
                title: `Yuk Lanjut Nabung "${g.name}"!`,
                message: `Tabunganmu baru terkumpul Rp ${g.currentAmount.toLocaleString('id-ID')} dari target Rp ${g.targetAmount.toLocaleString('id-ID')}. Jangan sampai lalai ya Sigma!`,
                type: 'goal'
              });
            }
          }
        });
      }

      // Tampilkan notifikasi belum dibaca yang paling baru
      setTimeout(() => {
        const unread = (useAppStore.getState().notifications || []).find(n => !n.isRead);
        if (unread) {
          setAlertData({ isOpen: true, title: unread.title, message: unread.message, id: unread.id });
        }
        setInitialNotifShown(true);
      }, 500); // Delay sedikit agar state sinkron
    }
  }, [mounted, isLoggedIn, initialNotifShown]); // Kurangi dependency agar tidak infinite loop saat addNotification

  const handleCloseAlert = () => {
    if (alertData.id) {
      markNotificationRead(alertData.id);
    }
    setAlertData({ ...alertData, isOpen: false });
  };

  if (!mounted || !hydrated || !isLoggedIn) return null;

  const mainTabs = ['/dashboard', '/transactions', '/budget', '/goals'];
  const showBottomNav = mainTabs.some(tab => pathname === tab || pathname?.startsWith(tab + '/'));

  return (
    <div className="relative h-[100dvh] flex flex-col bg-background">
      <main className={`flex-1 overflow-y-auto ${showBottomNav ? 'pb-24' : 'pb-0'}`}>
        {children}
      </main>
      {showBottomNav && <BottomNav />}
      <AlertModal isOpen={alertData.isOpen} onClose={handleCloseAlert} title={alertData.title} message={alertData.message} isError={true} />
    </div>
  );
}