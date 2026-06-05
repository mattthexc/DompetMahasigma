'use client';

import { useAppStore } from '@/store/useAppStore';
import { ChevronLeft, Bell, CheckCircle2, AlertTriangle, Target, Info, Sparkles, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/i18n';
import { format } from 'date-fns';
import { id as localeId, enUS as localeEn } from 'date-fns/locale';
import { ConfirmModal } from '@/components/CustomUI';
import { useState } from 'react';

export default function NotificationsPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const dateLocale = language === 'id' ? localeId : localeEn;
  const { notifications, markNotificationRead, deleteNotification, clearNotifications } = useAppStore();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleNotificationClick = (notif: any) => {
    markNotificationRead(notif.id);

    // Redirect based on notification type
    if (notif.type === 'budget') {
      router.push('/budget');
    } else if (notif.type === 'goal') {
      router.push('/goals');
    } else {
      // Default fallback or system notifications
      router.push('/profile');
    }
  };

  const markAllAsRead = () => {
    if (notifications) {
      notifications.forEach(n => markNotificationRead(n.id));
    }
  };

  return (
    <div className="pb-6">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-xl border-b border-border/50 px-6 pt-8 pb-4 flex justify-between items-center mt-0">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted transition-colors shadow-sm">
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">{t('notifications')}</h1>
        </div>
        {notifications && notifications.length > 0 && (
          <div className="flex gap-2">
            <button onClick={markAllAsRead} className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors shadow-sm">
              <CheckCircle2 size={20} />
            </button>
            <button onClick={() => setIsConfirmOpen(true)} className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 hover:bg-rose-500/20 transition-colors shadow-sm">
              <Trash2 size={20} />
            </button>
          </div>
        )}
      </div>

      <div className="p-6 space-y-4 pt-4">
        {(!notifications || notifications.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-4 opacity-60">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-2">
              <Bell size={40} className="text-muted-foreground" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">{t('noNotif')}</p>
          </div>
        ) : (
          notifications.map(notif => {
            // Tentukan Ikon dan Warna berdasarkan Tipe
            let Icon = Info;
            let iconColor = "text-indigo-500 bg-indigo-500/10";
            let unreadStyle = "bg-gradient-to-br from-indigo-500/5 to-transparent border-indigo-500/20";

            if (notif.type === 'budget') {
              Icon = AlertTriangle || Info;
              iconColor = "text-rose-500 bg-rose-500/10";
              unreadStyle = "bg-gradient-to-br from-rose-500/5 to-transparent border-rose-500/20";
            } else if (notif.type === 'goal') {
              Icon = Target;
              iconColor = "text-emerald-500 bg-emerald-500/10";
              unreadStyle = "bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20";
            }

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`group relative p-4 rounded-3xl border transition-all duration-300 cursor-pointer overflow-hidden ${notif.isRead
                    ? 'bg-card border-border shadow-sm hover:shadow-md hover:border-muted-foreground/30'
                    : `${unreadStyle} shadow-md scale-[1.01] ring-1 ring-primary/10`
                  }`}
              >
                {!notif.isRead && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-[100px] -z-10 pointer-events-none transition-transform group-hover:scale-110" />
                )}

                <div className="flex gap-4 items-start">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-105 ${notif.isRead ? 'bg-muted text-muted-foreground' : iconColor}`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>

                  <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-start gap-2">
                      <h4 className={`text-sm font-bold leading-tight ${notif.isRead ? 'text-foreground' : 'text-primary'}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse" />}
                    </div>

                    <p className="text-xs font-medium text-muted-foreground mt-1.5 leading-relaxed">
                      {notif.message}
                    </p>

                    <span className="text-[10px] font-bold text-muted-foreground/50 mt-3 block uppercase tracking-widest flex items-center gap-1">
                      {format(new Date(notif.date), 'dd MMM yyyy • HH:mm', { locale: dateLocale })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notif.id);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-colors opacity-50 group-hover:opacity-100"
                >
                  <X size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          clearNotifications();
          setIsConfirmOpen(false);
        }}
        title="Hapus Semua Notifikasi?"
        message="Seluruh riwayat notifikasi kamu akan dihapus secara permanen. Lanjutkan?"
        confirmText="Ya, Hapus Semua"
      />
    </div>
  );
}
