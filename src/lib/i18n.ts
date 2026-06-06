import { useAppStore } from '@/store/useAppStore';

const dictionary = {
  id: {
    // Menu & Navigation
    dashboard: 'Dasbor',
    transactions: 'Riwayat',
    budget: 'Anggaran',
    goals: 'Tabungan',
    profile: 'Profil',
    
    // Dashboard
    welcome: 'Selamat Datang,',
    balance: 'Saldo Mahasigma',
    safeLimit: 'Sisa Jatah',
    expense: 'Keluar',
    income: 'Masuk',
    borrow: 'Ngutang',
    lend: 'Diutangin',
    smartInput: 'Pencatatan Pintar',
    smartInputPlaceholder: 'Cth: Makan Siang 25k...',
    smartInputHint: 'AI otomatis mencatat Pemasukan, Pengeluaran & Hutang. Coba: <span className="italic font-bold">"Makan siang 20k"</span> atau <span className="italic font-bold">"Asep pinjam 50k"</span>.',
    analytics: 'Analitik Pengeluaran',
    noData: 'Belum ada data',
    daysLeftText: 'Hari Lagi',
    limitSettings: 'Pengaturan Sisa Jatah',
    autoAI: 'Otomatis (AI)',
    manualSet: 'Manual Set',
    maxDailySpend: 'Maksimal Uang Keluar Harian',
    aiLimitDesc1: 'Sigma AI mengatur batas pengeluaran amanmu menjadi',
    aiLimitDesc2: 'berdasarkan Hutang, Tabungan, Dana Darurat, dan sisa',
    aiLimitDesc3: 'Hari.',
    saveSettings: 'Simpan Pengaturan',
    day: 'hari',
    
    // Transactions
    all: 'Semua',
    search: 'Cari transaksi...',
    emptyTx: 'Tidak ada transaksi di kategori ini.',
    deleteTx: 'Hapus Transaksi?',
    deleteTxMsg: 'Data ini akan dihapus secara permanen dari riwayat arus kas. Jika ini tabungan, saldo utamamu akan dikembalikan.',
    detailTx: 'Detail Transaksi',
    date: 'Tanggal',
    category: 'Kategori',
    nominal: 'Nominal',
    desc: 'Deskripsi / Keterangan',
    type: 'Tipe Transaksi',
    
    // Settings & Profile
    settings: 'Pengaturan',
    financeMgmt: 'Manajemen Keuangan',
    balanceTarget: 'Target Saldo',
    allowanceDetail: 'Detail Uang Saku',
    incomeSourceLabel: 'Sumber Dana',
    routineAllowance: 'Jatah Saldo Rutin (Rp)',
    cycle: 'Siklus Turun',
    weekly: 'Mingguan',
    biweekly: '2 Minggu',
    monthly: 'Bulanan',
    weeklySuffix: '/ Minggu',
    biweeklySuffix: '/ 2 Minggu',
    monthlySuffix: '/ Bulan',
    estDate: 'Estimasi Tanggal',
    selectDate: 'Pilih Tgl',
    appPref: 'Preferensi Aplikasi',
    sessionCloud: 'Sesi & Data Cloud',
    synced: 'Tersinkronisasi dengan Firestore 🔥',
    logoutConfirmTitle: 'Keluar Akun?',
    logoutConfirmDesc: 'Sesi kamu akan diakhiri dan harus login kembali.',
    resetConfirmTitle: 'Reset Database?',
    resetConfirmDesc: 'Semua transaksi, anggaran, dan tabungan akan musnah permanen. Yakin?',
    yesLogout: 'Ya, Keluar',
    yesReset: 'Ya, Reset',
    supportDev: 'Dukung Developer',
    supportDesc1: 'Follow IG',
    supportDesc2: 'atau kirim bantuan (Dana) ke',
    language: 'Bahasa',
    lang_id: 'Bahasa Indonesia',
    lang_en: 'English',
    theme: 'Tema Tampilan',
    theme_light: 'Mode Terang',
    theme_dark: 'Mode Gelap',
    resetDb: 'Reset Semua Database',
    logout: 'Keluar (Logout)',
    
    // Notifications
    notifications: 'Notifikasi',
    noNotif: 'Belum ada notifikasi baru',
    markAllRead: 'Tandai Semua Dibaca',
    
    // Alerts
    understood: 'Mengerti',
    cancel: 'Batal',
    close: 'Tutup',
    confirm: 'Ya, Lanjutkan',

    // Goals (Tabungan)
    goalsDesc: 'Sisihkan saldo untuk impianmu.',
    newGoal: 'Buat Impian Baru',
    newGoalTitle: 'Target Impian Baru',
    goalName: 'Nama Impian',
    targetAmount: 'Target Harga (Rp)',
    targetDate: 'Target Waktu (Opsional)',
    saveTarget: 'Simpan Target',
    noTarget: 'Belum Ada Target',
    startTarget: 'Klik tombol di atas untuk memulai!',
    collected: 'Terkumpul: Rp',
    target: 'Target:',
    achieved: 'Tercapai',
    timeLeft: 'Sisa waktu',
    days: 'hari',
    endsToday: 'Berakhir hari ini!',
    overdue: 'Terlewat',
    saveNow: 'Nabung Sekarang',
    availableBalance: 'Saldo Utamamu Tersedia',
    saveAmount: 'Nominal yang ingin ditabung (Rp)',
    confirmSave: 'Sahkan Tabungan',
    goalReached: '🎉 Target Impian Tercapai!',
    deleteGoalTitle: 'Hapus Impian?',
    deleteGoalMsg: 'Uang yang sudah terkumpul akan dikembalikan ke Saldo Utamamu.',
    
    // Budget (Anggaran)
    budgetDesc: 'Jaga Pengeluaranmu!',
    newCategory: 'Tambah Kategori Baru',
    editCategory: 'Edit Kategori',
    newCategoryTitle: 'Kategori Baru',
    categoryName: 'Nama Kategori',
    budgetLimit: 'Batas Anggaran (Rp)',
    save: 'Simpan',
    safe: 'Aman Terkendali',
    overbudget: 'Overbudget!',
    from: 'dari',
    deleteCatTitle: 'Hapus Kategori?',
    deleteCatMsg: 'Riwayat transaksinya tidak akan terhapus, tapi batas anggarannya akan hilang.',
    delete: 'Hapus',
  },
  en: {
    // Menu & Navigation
    dashboard: 'Dashboard',
    transactions: 'History',
    budget: 'Budget',
    goals: 'Savings',
    profile: 'Profile',
    
    // Dashboard
    welcome: 'Welcome,',
    balance: 'Sigma Balance',
    safeLimit: 'Daily Limit',
    expense: 'Expense',
    income: 'Income',
    borrow: 'Borrow',
    lend: 'Lend',
    smartInput: 'Smart Log',
    smartInputPlaceholder: 'e.g., Lunch 25k...',
    smartInputHint: 'AI automatically logs Income, Expense & Debts. Try: <span className="italic font-bold">"Lunch 20k"</span> or <span className="italic font-bold">"Asep borrowed 50k"</span>.',
    analytics: 'Expense Analytics',
    noData: 'No data yet',
    daysLeftText: 'Days Left',
    limitSettings: 'Daily Limit Settings',
    autoAI: 'Auto (AI)',
    manualSet: 'Manual Set',
    maxDailySpend: 'Maximum Daily Spend',
    aiLimitDesc1: 'Sigma AI sets your safe spending limit to',
    aiLimitDesc2: 'based on Debts, Savings, Emergency Fund, and the remaining',
    aiLimitDesc3: 'Days.',
    saveSettings: 'Save Settings',
    day: 'day',
    
    // Transactions
    all: 'All',
    search: 'Search transactions...',
    emptyTx: 'No transactions in this category.',
    deleteTx: 'Delete Transaction?',
    deleteTxMsg: 'This will permanently delete the transaction from history. If it is a saving, the amount will be refunded to your balance.',
    detailTx: 'Transaction Detail',
    date: 'Date',
    category: 'Category',
    nominal: 'Amount',
    desc: 'Description / Note',
    type: 'Transaction Type',
    
    // Settings & Profile
    settings: 'Settings',
    financeMgmt: 'Financial Management',
    balanceTarget: 'Balance Target',
    allowanceDetail: 'Allowance Details',
    incomeSourceLabel: 'Income Source',
    routineAllowance: 'Routine Allowance (Rp)',
    cycle: 'Cycle',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    weeklySuffix: '/ Week',
    biweeklySuffix: '/ 2 Weeks',
    monthlySuffix: '/ Month',
    estDate: 'Estimated Date',
    selectDate: 'Select Date',
    appPref: 'App Preferences',
    sessionCloud: 'Session & Cloud Data',
    synced: 'Synced with Firestore 🔥',
    logoutConfirmTitle: 'Log Out?',
    logoutConfirmDesc: 'Your session will end and you will need to log in again.',
    resetConfirmTitle: 'Reset Database?',
    resetConfirmDesc: 'All transactions, budgets, and savings will be permanently deleted. Are you sure?',
    yesLogout: 'Yes, Log Out',
    yesReset: 'Yes, Reset',
    supportDev: 'Support Developer',
    supportDesc1: 'Follow IG',
    supportDesc2: 'or send support via Dana to',
    language: 'Language',
    lang_id: 'Bahasa Indonesia',
    lang_en: 'English',
    theme: 'App Theme',
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    resetDb: 'Reset All Databases',
    logout: 'Log Out',
    
    // Notifications
    notifications: 'Notifications',
    noNotif: 'No new notifications',
    markAllRead: 'Mark All as Read',
    
    // Alerts
    understood: 'Understood',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Yes, Proceed',

    // Goals (Tabungan)
    goalsDesc: 'Set aside money for your dreams.',
    newGoal: 'Create New Goal',
    newGoalTitle: 'New Goal Target',
    goalName: 'Goal Name',
    targetAmount: 'Target Amount (Rp)',
    targetDate: 'Target Date (Optional)',
    saveTarget: 'Save Target',
    noTarget: 'No Target Yet',
    startTarget: 'Click the button above to start!',
    collected: 'Collected: Rp',
    target: 'Target:',
    achieved: 'Achieved',
    timeLeft: 'Time remaining',
    days: 'days',
    endsToday: 'Ends today!',
    overdue: 'Overdue by',
    saveNow: 'Save Now',
    availableBalance: 'Your Available Balance',
    saveAmount: 'Amount to save (Rp)',
    confirmSave: 'Confirm Savings',
    goalReached: '🎉 Goal Reached!',
    deleteGoalTitle: 'Delete Goal?',
    deleteGoalMsg: 'The collected money will be refunded to your Main Balance.',
    
    // Budget (Anggaran)
    budgetDesc: 'Keep your expenses in check!',
    newCategory: 'Add New Category',
    editCategory: 'Edit Category',
    newCategoryTitle: 'New Category',
    categoryName: 'Category Name',
    budgetLimit: 'Budget Limit (Rp)',
    save: 'Save',
    safe: 'On Track',
    overbudget: 'Overbudget!',
    from: 'of',
    deleteCatTitle: 'Delete Category?',
    deleteCatMsg: 'Transaction history will remain, but the budget limit will be removed.',
    delete: 'Delete',
  }
};

export type DictKey = keyof typeof dictionary.id;

export const useTranslation = () => {
  const language = useAppStore(state => state.language);
  
  const t = (key: DictKey): string => {
    return dictionary[language][key] || dictionary['id'][key] || key;
  };
  
  return { t, language };
};

// Helper for category translations
export const translateCategory = (catName: string, lang: 'id' | 'en'): string => {
  if (lang === 'id') return catName;
  
  const map: Record<string, string> = {
    "Makan & Minum": "Food & Beverage",
    "Transportasi": "Transportation",
    "Kebutuhan Kos": "Housing & Bills",
    "Pendidikan": "Education",
    "Hutang": "Debts",
    "Lainnya": "Others"
  };
  
  return map[catName] || catName;
};

// Helper for dynamic AI goal tips
export const getAITip = (
  lang: 'id' | 'en', 
  hasDeadline: boolean, 
  daysLeft: number, 
  shortage: number, 
  percentage: number, 
  currentBalance: number
): string => {
  if (hasDeadline) {
    if (daysLeft > 0) {
      const dailyNeed = Math.ceil(shortage / daysLeft);
      return lang === 'en' 
        ? `💡 Sigma AI: Set aside around Rp ${dailyNeed.toLocaleString('id-ID')}/day to hit this goal on time! 🚀`
        : `💡 Sigma AI: Sisihkan sekitar Rp ${dailyNeed.toLocaleString('id-ID')}/hari biar impian ini terwujud tepat waktu! 🚀`;
    } else {
      return lang === 'en'
        ? "💡 Sigma AI: Deadline has passed! Let's finish this up with your spare cash."
        : "💡 Sigma AI: Batas waktu sudah lewat! Yuk selesaikan secepatnya pakai uang dinginmu.";
    }
  } else {
    if (percentage > 80) {
      return lang === 'en'
        ? `💡 Sigma AI: Almost there bestie! Just Rp ${shortage.toLocaleString('id-ID')} left to check this out. LFG! 🔥`
        : `💡 Sigma AI: Dikit lagi bestie! Sisa Rp ${shortage.toLocaleString('id-ID')} buat check out impianmu. Gas! 🔥`;
    } else if (currentBalance >= shortage * 0.5) {
      return lang === 'en'
        ? `💡 Sigma AI: Your balance is looking good! Secure some of it here to reach this goal faster. 💸`
        : `💡 Sigma AI: Saldumu aman kok! Yuk amankan sebagian ke sini biar target cepat beres. 💸`;
    } else {
      return lang === 'en'
        ? `💡 Sigma AI: It's a long journey, but saving Rp 10,000 a day matters. You got this! 💪`
        : `💡 Sigma AI: Perjalanan masih panjang, tapi nyisihin Rp 10.000 sehari juga sangat berharga lho. Semangat! 💪`;
    }
  }
};

export const getBudgetAITip = (
  lang: 'id' | 'en',
  catName: string,
  period: 'monthly' | 'cycle',
  percent: number,
  isOver: boolean
): string => {
  const tCat = translateCategory(catName, lang);
  const periodTextId = period === 'cycle' ? 'siklus' : 'bulan';
  const periodTextEn = period === 'cycle' ? 'cycle' : 'month';

  if (isOver) {
    return lang === 'en'
      ? `⚠️ Whoops, your ${tCat} expenses went over the limit! Let's hit the brakes so you can survive the rest of the ${periodTextEn}.`
      : `⚠️ Waduh, pengeluaran ${tCat} kamu kelewat batas! Rem dulu yuk pengeluarannya biar akhir ${periodTextId} aman.`;
  } else if (percent > 80) {
    return lang === 'en'
      ? `⚠️ Warning! Your ${tCat} budget is running low. Cut down on unnecessary snacks!`
      : `⚠️ Warning! Budget ${tCat} kamu sisa dikit lagi. Kurangin jajan yang nggak penting ya!`;
  } else if (percent > 50) {
    return lang === 'en'
      ? `💪 Halfway there for your ${tCat} budget. Keep tracking your expenses.`
      : `💪 Setengah jalan nih untuk budget ${tCat}. Jaga terus pengeluaranmu.`;
  } else {
    return lang === 'en'
      ? `✨ Awesome! Your ${tCat} budget is super safe. Keep up the good work!`
      : `✨ Hebat! Budget ${tCat} kamu masih sangat aman. Pertahankan hematnya!`;
  }
};
