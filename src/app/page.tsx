'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

export default function RootPage() {
  const router = useRouter();
  const { isLoggedIn } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    if (isLoggedIn) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isLoggedIn, router]);

  if (!mounted) return <div className="min-h-screen bg-background flex items-center justify-center font-bold text-foreground">Memuat Aplikasi...</div>;
  
  return null;
}