'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ScrollText, Wallet, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

export default function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { name: t('dashboard'), href: '/dashboard', icon: Home },
    { name: t('transactions'), href: '/transactions', icon: ScrollText },
    { name: t('budget'), href: '/budget', icon: Wallet },
    { name: t('goals'), href: '/goals', icon: Target },
  ];

  return (
    <div className="absolute bottom-0 w-full max-w-md bg-background/90 backdrop-blur-lg border-t border-border pb-6 pt-2 px-6 z-50 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-300",
                isActive ? "bg-primary/15 scale-110" : "bg-transparent"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-semibold mt-1">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}