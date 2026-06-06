import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type TransactionType = 'income' | 'expense' | 'debt_borrow' | 'debt_lend' | 'saving';
export type AllowancePeriod = 'weekly' | 'biweekly' | 'monthly';

export interface Wallet { id: string; name: string; balance: number; icon: string; isPrimary?: boolean; }
export interface Transaction { id: string; title: string; amount: number; category: string; type: TransactionType; date: string; walletId?: string; }
export interface Category { id: string; name: string; limitAmount: number; icon: string; period?: 'monthly' | 'cycle'; }
export interface Goal { id: string; name: string; targetAmount: number; currentAmount: number; icon: string; deadline?: string; }
export interface ChatMessage { id: string; sender: 'user' | 'ai'; text: string; }
// BARU: Interface Hutang Teman
export interface Debt { id: string; borrowerName: string; amount: number; isPaid: boolean; date: string; }

// BARU: Interface Notifikasi
export interface AppNotification { id: string; title: string; message: string; date: string; isRead: boolean; type: 'budget' | 'goal' | 'system'; }

interface AppState {
  uid: string | null;
  user: { name: string; email?: string; campus?: string; allowanceAmount: number; allowancePeriod: AllowancePeriod; avatarUrl?: string; incomeSource?: string; allowanceDate?: string; customSafeLimit?: { isManual: boolean; amount: number; }; xp?: number; };
  balance: number;
  wallets: Wallet[];
  transactions: Transaction[];
  categories: Category[];
  goals: Goal[];
  chatMessages: ChatMessage[];
  debts: Debt[]; // BARU: State Hutang
  notifications: AppNotification[]; // BARU: State Notifikasi
  isLoggedIn: boolean;
  theme: 'light' | 'dark';
  language: 'id' | 'en'; // BARU: Pilihan Bahasa
  fontSize: number; // BARU: Pengaturan Ukuran Font

  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'id' | 'en') => void; // BARU
  setFontSize: (size: number) => void; // BARU
  loginWithCloud: (uid: string, data: any) => void;
  syncToCloud: () => void;
  logout: () => void;
  resetData: () => void;
  
  updateUser: (data: Partial<AppState['user']>) => void;
  addXp: (amount: number) => void;
  
  addWallet: (wallet: Omit<Wallet, 'id'>) => void;
  updateWallet: (id: string, data: Partial<Wallet>) => void;
  deleteWallet: (id: string) => void;
  
  addTransaction: (tx: Omit<Transaction, 'id'>) => boolean;
  deleteTransaction: (id: string) => void;
  
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount'>) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addGoalProgress: (id: string, amount: number) => boolean;
  
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // BARU: Fungsi Daftar Dosa Teman
  addDebt: (debt: Omit<Debt, 'id' | 'isPaid' | 'date'>) => boolean;
  payDebt: (id: string) => void;
  deleteDebt: (id: string) => void;

  // BARU: Fungsi Notifikasi
  addNotification: (notif: Omit<AppNotification, 'id' | 'date' | 'isRead'>) => void;
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
}

const initialState = {
  uid: null,
  user: { name: 'Sigma', email: '', campus: '', allowanceAmount: 0, allowancePeriod: 'monthly' as AllowancePeriod, avatarUrl: '', incomeSource: 'Orang Tua', allowanceDate: '', xp: 0 },
  balance: 0,
  wallets: [],
  transactions: [],
  categories: [
    { id: '1', name: 'Makan & Minum', limitAmount: 600000, icon: '🍔' },
    { id: '2', name: 'Transportasi', limitAmount: 200000, icon: '🚗' },
    { id: '3', name: 'Pendidikan', limitAmount: 300000, icon: '📚' },
  ],
  goals: [],
  chatMessages: [],
  debts: [],
  notifications: [],
  isLoggedIn: false,
  theme: 'light' as const,
  language: 'id' as const,
  fontSize: 16,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => { set({ language }); get().syncToCloud(); },
      setFontSize: (fontSize) => { set({ fontSize }); get().syncToCloud(); },
      loginWithCloud: (uid, data) => set({ uid, isLoggedIn: true, ...data }),
      
      syncToCloud: async () => {
        const state = get();
        if (!state.uid) return;
        try {
          const userRef = doc(db, 'users', state.uid);
          const financeRef = doc(db, 'users', state.uid, 'data', 'finance');
          const chatRef = doc(db, 'users', state.uid, 'data', 'chats');

          // Sanitasi untuk mencegah error "Unsupported field value: undefined" di Firebase
          const sanitize = (obj: any) => JSON.parse(JSON.stringify(obj));

          await setDoc(userRef, sanitize({ profile: state.user, theme: state.theme, language: state.language || 'id', fontSize: state.fontSize || 16, updatedAt: new Date().toISOString() }), { merge: true });
          await setDoc(financeRef, sanitize({ balance: state.balance, wallets: state.wallets || [], transactions: state.transactions, categories: state.categories, goals: state.goals, debts: state.debts, notifications: state.notifications || [] }), { merge: true });
          await setDoc(chatRef, sanitize({ messages: state.chatMessages }), { merge: true });
        } catch (e) { console.error("Gagal Sync ke Cloud", e); }
      },

      logout: () => {
        const currentTheme = get().theme;
        set({ ...initialState, theme: currentTheme, isLoggedIn: false, uid: null });
        localStorage.removeItem('dompet-mahasigma-storage');
      },

      resetData: () => {
        const currentTheme = get().theme;
        set({ ...initialState, theme: currentTheme, isLoggedIn: false, uid: null });
        localStorage.removeItem('dompet-mahasigma-storage');
      },
      
      updateUser: (data) => { set((state) => ({ user: { ...state.user, ...data } })); get().syncToCloud(); },
      addXp: (amount) => { set((state) => ({ user: { ...state.user, xp: (state.user.xp || 0) + amount } })); get().syncToCloud(); },
      
      addWallet: (wallet) => { set((state) => ({ wallets: [...(state.wallets || []), { ...wallet, id: Date.now().toString() }] })); get().syncToCloud(); },
      updateWallet: (id, data) => { set((state) => ({ wallets: (state.wallets || []).map(w => w.id === id ? { ...w, ...data } : w) })); get().syncToCloud(); },
      deleteWallet: (id) => { 
        set((state) => {
          const wToDelete = (state.wallets || []).find(w => w.id === id);
          if (!wToDelete) return state;
          return { wallets: state.wallets.filter(w => w.id !== id), balance: state.balance - wToDelete.balance };
        }); 
        get().syncToCloud(); 
      },
      
      addTransaction: (tx) => {
        const state = get();
        const isDeduction = tx.type === 'expense' || tx.type === 'debt_lend' || tx.type === 'saving';
        if (isDeduction && tx.amount > state.balance) return false;
        const newBalance = isDeduction ? state.balance - tx.amount : state.balance + tx.amount;
        
        // Pengecekan Budget Limit (80% dan 100%)
        if (tx.type === 'expense') {
          const category = state.categories.find(c => c.name === tx.category);
          if (category) {
            const currentSpent = state.transactions.filter(t => t.category === tx.category && t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
            const newSpent = currentSpent + tx.amount;
            
            if (newSpent > category.limitAmount && currentSpent <= category.limitAmount) {
              get().addNotification({ title: 'Batas Anggaran Terlewati!', message: `Pengeluaran "${tx.category}" sudah melampaui batas anggaran (Rp ${category.limitAmount.toLocaleString('id-ID')}).`, type: 'budget' });
            } else if (newSpent >= category.limitAmount * 0.8 && currentSpent < category.limitAmount * 0.8) {
              get().addNotification({ title: 'Awas Anggaran Menipis', message: `Pengeluaran "${tx.category}" sudah mencapai 80% dari batas (Rp ${category.limitAmount.toLocaleString('id-ID')}).`, type: 'budget' });
            }
          }
        }

        let newWallets = state.wallets || [];
        if (newWallets.length === 0) {
           newWallets = [{ id: '1', name: 'Dompet Utama', balance: state.balance, icon: '💰', isPrimary: true }];
        }
        
        if (tx.walletId) {
           newWallets = newWallets.map(w => w.id === tx.walletId ? { ...w, balance: isDeduction ? w.balance - tx.amount : w.balance + tx.amount } : w);
        } else {
           newWallets = newWallets.map(w => w.isPrimary ? { ...w, balance: isDeduction ? w.balance - tx.amount : w.balance + tx.amount } : w);
        }

        set((state) => ({ balance: newBalance, wallets: newWallets, transactions: [{ ...tx, id: Date.now().toString(), date: new Date().toISOString() }, ...state.transactions] }));
        
        // GAMIFIKASI: Beri 10 XP setiap kali nyatet
        get().addXp(10);
        
        get().syncToCloud(); return true;
      },
      
      deleteTransaction: (id) => {
        set((state) => {
          const txToDelete = state.transactions.find(tx => tx.id === id);
          if (!txToDelete) return state;
          const isDeduction = txToDelete.type === 'expense' || txToDelete.type === 'debt_lend' || txToDelete.type === 'saving';
          const newBalance = isDeduction ? state.balance + txToDelete.amount : state.balance - txToDelete.amount;
          
          let newDebts = state.debts || [];
          if (txToDelete.type === 'debt_lend') {
             // Cari debt yang belum dibayar dengan nominal sama dan nama peminjam sama
             newDebts = newDebts.filter(d => !(d.amount === txToDelete.amount && !d.isPaid && `Dipinjam: ${d.borrowerName}` === txToDelete.title));
          }

          let newGoals = state.goals || [];
          if (txToDelete.type === 'saving') {
             // Kurangi currentAmount pada goal yang terkait
             newGoals = newGoals.map(g => {
                if (`Nabung: ${g.name}` === txToDelete.title) {
                   return { ...g, currentAmount: Math.max(0, g.currentAmount - txToDelete.amount) };
                }
                return g;
             });
          }

          let newWallets = state.wallets || [];
          if (newWallets.length === 0) {
             newWallets = [{ id: '1', name: 'Dompet Utama', balance: state.balance, icon: '💰', isPrimary: true }];
          }
          if (txToDelete.walletId) {
             newWallets = newWallets.map(w => w.id === txToDelete.walletId ? { ...w, balance: isDeduction ? w.balance + txToDelete.amount : w.balance - txToDelete.amount } : w);
          } else {
             newWallets = newWallets.map(w => w.isPrimary ? { ...w, balance: isDeduction ? w.balance + txToDelete.amount : w.balance - txToDelete.amount } : w);
          }

          return { 
            balance: newBalance, 
            wallets: newWallets,
            transactions: state.transactions.filter(tx => tx.id !== id),
            debts: newDebts,
            goals: newGoals
          };
        }); get().syncToCloud();
      },

      addCategory: (cat) => { set((state) => ({ categories: [...state.categories, { ...cat, id: Date.now().toString() }] })); get().syncToCloud(); },
      updateCategory: (id, data) => { set((state) => ({ categories: state.categories.map(c => c.id === id ? { ...c, ...data } : c) })); get().syncToCloud(); },
      deleteCategory: (id) => { set((state) => ({ categories: state.categories.filter(c => c.id !== id) })); get().syncToCloud(); },

      addGoal: (goal) => { set((state) => ({ goals: [...(state.goals || []), { ...goal, currentAmount: 0, id: Date.now().toString() }] })); get().syncToCloud(); },
      updateGoal: (id, data) => { set((state) => ({ goals: (state.goals || []).map(g => g.id === id ? { ...g, ...data } : g) })); get().syncToCloud(); },
      deleteGoal: (id) => {
        set((state) => {
          const goalToDelete = (state.goals || []).find(g => g.id === id);
          if (!goalToDelete) return state;
          return { balance: state.balance + goalToDelete.currentAmount, goals: state.goals.filter(g => g.id !== id) };
        }); get().syncToCloud();
      },
      addGoalProgress: (id, amount) => {
        const state = get();
        if (amount > 0 && amount > state.balance) return false;
        const goal = state.goals?.find(g => g.id === id);
        const newTransaction: Transaction = { id: Date.now().toString(), title: `Nabung: ${goal?.name || 'Impian'}`, amount: amount, category: 'Tabungan', type: 'saving', date: new Date().toISOString() };
        set((state) => ({ balance: state.balance - amount, goals: (state.goals || []).map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g), transactions: [newTransaction, ...state.transactions] }));
        get().syncToCloud(); return true;
      },

      addChatMessage: (msg) => { set((state) => ({ chatMessages: [...state.chatMessages, msg] })); get().syncToCloud(); },
      clearChat: () => { set({ chatMessages: [] }); get().syncToCloud(); },

      // LOGIKA DAFTAR DOSA TEMAN
      addDebt: (debt) => {
        const state = get();
        if (debt.amount > state.balance) return false; // Gak bisa minjemin kalo saldo kurang
        
        const newTransaction: Transaction = { id: Date.now().toString(), title: `Dipinjam: ${debt.borrowerName}`, amount: debt.amount, category: 'Hutang', type: 'debt_lend', date: new Date().toISOString() };
        set((state) => ({
          balance: state.balance - debt.amount,
          debts: [{ ...debt, id: Date.now().toString(), isPaid: false, date: new Date().toISOString() }, ...(state.debts || [])],
          transactions: [newTransaction, ...state.transactions]
        }));
        get().syncToCloud(); return true;
      },
      payDebt: (id) => {
        set((state) => {
          const debt = (state.debts || []).find(d => d.id === id);
          if (!debt || debt.isPaid) return state;
          
          const newTransaction: Transaction = { id: Date.now().toString(), title: `Dibayar: ${debt.borrowerName}`, amount: debt.amount, category: 'Hutang', type: 'income', date: new Date().toISOString() };
          return {
            balance: state.balance + debt.amount,
            debts: state.debts.map(d => d.id === id ? { ...d, isPaid: true } : d),
            transactions: [newTransaction, ...state.transactions]
          };
        }); get().syncToCloud();
      },
      deleteDebt: (id) => {
        set((state) => ({ debts: (state.debts || []).filter(d => d.id !== id) }));
        get().syncToCloud();
      },
      
      addNotification: (notif) => {
        const newNotif = { ...notif, id: Date.now().toString(), date: new Date().toISOString(), isRead: false };
        set(state => ({ notifications: [newNotif, ...(state.notifications || [])] }));
        get().syncToCloud();
      },
      markNotificationRead: (id) => {
        set(state => ({ notifications: (state.notifications || []).map(n => n.id === id ? { ...n, isRead: true } : n) }));
        get().syncToCloud();
      },
      deleteNotification: (id) => {
        set(state => ({ notifications: (state.notifications || []).filter(n => n.id !== id) }));
        get().syncToCloud();
      },
      clearNotifications: () => {
        set({ notifications: [] });
        get().syncToCloud();
      }
    }),
    { name: 'dompet-mahasigma-storage' }
  )
);