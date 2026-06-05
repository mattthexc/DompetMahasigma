dompetmahasigma/ (Root Folder)
├── .next/                (Muncul kalau sudah di-build/run, abaikan saja)
├── node_modules/         (Bawaan npm, jangan pernah diutak-atik)
├── public/               (Di luar src: Tempat aset statis seperti logo, gambar, manifest PWA)
│
├── src/                  👈 INI KERAJAANMU (Tempat ngoding 100%)
│   ├── app/              (Folder inti untuk Routing/Halaman)
│   │   ├── (app)/        (Grup folder buatan kita untuk layout Bottom Nav)
│   │   ├── globals.css   (Styling CSS utama)
│   │   ├── layout.tsx    (Kerangka HTML utama aplikasi)
│   │   └── page.tsx      (Halaman utama/redirect)
│   │
│   ├── components/       (Tempat komponen UI yang bisa dipakai berulang)
│   │   ├── ui/           (Otomatis dibuat oleh shadcn saat kamu install komponen)
│   │   └── BottomNav.tsx (Komponen buatan kita)
│   │
│   ├── lib/              (Otomatis dibuat oleh shadcn berisi fungsi utilitas 'utils.ts')
│   │
│   └── store/            (Folder buatan kita untuk State Management)
│       └── useAppStore.ts
│
├── .gitignore            (Daftar file yang tidak diupload ke GitHub)
├── eslint.config.mjs     (Konfigurasi Linter)
├── next.config.ts        (Konfigurasi Next.js)
├── package.json          (Daftar library/dependency)
├── tailwind.config.ts    (Konfigurasi Tailwind CSS)
└── tsconfig.json         (Konfigurasi TypeScript)