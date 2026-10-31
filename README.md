# ✅ TaskMate

Website pengelola tugas mahasiswa — dark mode simpel, dibangun dengan **React + TypeScript + Vite**.

## 🚀 Fitur

- **Auth 2 tipe akun**: Pengurus 👑 & Anggota 🎓 — login email + password (hash SHA-256 via Web Crypto)
- **Login Google** (simulasi demo client-side, lihat catatan produksi di bawah)
- **Ruang kelas**: pengurus membuat ruang kelas → sistem membuat kode undangan + link (`/join/KODE`); anggota cukup tempel kode/link untuk gabung
- **Ceklis tugas** per pengguna + progress bar progres pribadi
- **Deadline**: badge status otomatis (Terlambat / Hari ini / ≤3 hari / Aman)
- **Deteksi bentrokan deadline**: peringatan otomatis saat pengurus menambah tugas yang deadline-nya berdekatan dengan tugas lain (±1 hari), plus badge bentrok di setiap kartu tugas
- **🤖 AI Summarizer**: ringkasan ekstraktif berbasis frekuensi kata, berjalan 100% offline di browser
- **📄 File Converter**: gambar (PNG/JPEG/WebP via canvas) & dokumen teks (TXT/MD/HTML/CSV/JSON, termasuk JSON ↔ CSV)
- 🌙 UI dark mode yang bersih dan minimalis

## ▶️ Menjalankan Project

```bash
npm install
npm run dev
```

Buka http://localhost:5173

## 👤 Akun Demo (otomatis dibuat saat pertama kali dibuka)

| Peran    | Email             | Password  |
|----------|-------------------|-----------|
| Pengurus | pengurus@demo.id  | demo123   |
| Anggota  | anggota@demo.id   | demo123   |

Kode ruang kelas demo: **KELAS1** (atau pakai link undangan dari halaman kelas).

## 📁 Struktur Folder

```
taskmate/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx                 # entry point + seed data demo
    ├── App.tsx                  # routing + guard auth
    ├── styles/
    │   └── global.css           # tema dark mode & seluruh styling
    ├── types/
    │   └── index.ts             # tipe User, Classroom, Task
    ├── lib/                     # logika bisnis terpisah dari UI
    │   ├── storage.ts           # lapisan localStorage (ganti dg backend di sini)
    │   ├── auth.ts              # register/login email, login Google, sesi
    │   ├── classes.ts           # CRUD ruang kelas + kode/link undangan
    │   ├── tasks.ts             # CRUD tugas + ceklis
    │   ├── deadline.ts          # format deadline + deteksi bentrokan
    │   ├── summarizer.ts        # algoritma ringkasan ekstraktif
    │   ├── converter.ts         # konversi file client-side
    │   └── seed.ts              # data demo
    ├── context/
    │   └── AuthContext.tsx      # state auth global
    ├── components/
    │   ├── Navbar.tsx
    │   ├── Modal.tsx
    │   ├── ClassroomCard.tsx
    │   ├── TaskItem.tsx
    │   └── tools/
    │       ├── Summarizer.tsx
    │       └── FileConverter.tsx
    └── pages/
        ├── LoginPage.tsx
        ├── RegisterPage.tsx
        ├── DashboardPage.tsx
        ├── ClassroomPage.tsx
        ├── ToolsPage.tsx
        └── JoinPage.tsx
```

## 🔵 Catatan: Google Auth & Produksi

- Login Google saat ini adalah **simulasi client-side**, karena Google OAuth sungguhan butuh Client ID + backend (Firebase/Supabase). Untuk produksi:
  1. `npm install firebase`
  2. Buat project di Firebase Console → aktifkan **Authentication → Google**
  3. Ganti fungsi `loginGoogle()` di `src/lib/auth.ts` dengan `signInWithPopup(auth, new GoogleAuthProvider())`
- Seluruh data disimpan di `localStorage`. Untuk multi-device, ganti implementasi `src/lib/storage.ts` dengan panggilan API backend (Supabase, Firestore, atau REST API sendiri).
