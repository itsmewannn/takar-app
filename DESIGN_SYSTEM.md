# DESIGN SYSTEM & UI SPECIFICATION: TAKAR

## 1. Visual Direction: Warm Editorial Utilitarian
- **Vibe:** Presisi, bersih, hangat, dan cepat dipindai mata dalam 2 detik. Terasa seperti alat ukur modern yang membumi untuk keseharian di Indonesia.
- **Viewport Priority:** Mobile-first (`max-w-[460px] mx-auto min-h-dvh`). Di desktop, tampil sebagai *centered mobile frame* dengan garis tepi halus (`border-x border-[#E6E1D8]`) di atas latar belakang netral.

## 2. Strict Anti-AI Slop Rules (WAJIB DIPATUHI)
- **DILARANG** memakai gradasi ungu, biru neon, atau pink di mana pun.
- **DILARANG** memakai efek *glassmorphism* berlebihan, *neon glow*, atau *drop shadow* tebal.
- **DILARANG** memakai emoji sebagai ikon antarmuka (gunakan ikon *stroke* 1.5px dari `lucide-react` secara konsisten).
- **DILARANG** memakai *card* bertumpuk dengan sudut terlalu bulat (`rounded-3xl`) di semua elemen. Gunakan batas garis tipis (`1px solid`), spasi terukur, dan tipografi sebagai pembentuk hierarki.

## 3. Color Tokens
- **Canvas / Background:** `#FAF8F4` (Warm Alabaster — nyaman di mata, tidak silau seperti putih polos)
- **Surface / Elevated Panel:** `#FFFFFF` (Pure White untuk blok interaktif utama)
- **Subtle Surface:** `#F2EFE9` (Stone Wash untuk chip tidak aktif & background progress bar)
- **Hairline Border:** `#E5E0D8` (1px divider yang rapi)
- **Primary Ink (Text):** `#181715` (Deep Charcoal)
- **Secondary Ink:** `#68645E` (Warm Slate untuk label & metadata)
- **Primary Action / Accent:** `#C84B31` (Terracotta / Sambal — untuk tombol CTA utama & indikator Kalori)
- **Hero Metric (Protein):** `#245C43` (Deep Forest Leaf — kontras tinggi, fokus utama user)
- **Carbs Semantic:** `#C97A1D` (Kunyit / Ochre)
- **Fat Semantic:** `#5A6270` (Muted Steel)
- **Warning / Low Confidence:** `#B45309` pada background `#FEF3C7`

## 4. Typography System
- **UI & Headings:** `Plus Jakarta Sans` (Weights: 500, 600, 700). Tracking sedikit rapat (`-0.02em`) untuk judul besar.
- **Data, Angka Makro & Gramasi:** `JetBrains Mono` (Weights: 500, 600) dengan **`font-variant-numeric: tabular-nums`** wajib aktif agar angka tidak bergeser saat user melakukan 1-tap adjustment.
- **Scale:**
  - Hero Metric (Sisa/Total Protein): `36px / 1.1` Mono Bold
  - Page Title: `20px / 1.25` Sans SemiBold
  - Section Label: `11px / 1.2` Sans SemiBold, `uppercase`, `tracking-[0.08em]`, warna `#68645E`
  - Body / Food Item: `15px / 1.4` Sans Medium
  - Micro / Hidden Cal Tag: `12px / 1.3` Mono Regular

## 5. Layout, Spacing & Radius
- **Base Grid:** Kelipatan 4px (`p-4` = 16px horizontal padding standar halaman).
- **Border Radius:** Terukur dan konsisten: `8px` (`rounded-lg`) untuk kartu/panel, `6px` (`rounded-md`) untuk chip porsi & input, `9999px` hanya untuk tombol shutter kamera atau badge status mini.
- **Elevation:** Flat-first. Gunakan `border border-[#E5E0D8]` alih-alih shadow.

## 6. Screen-by-Screen Blueprint (4 Core Views)

### Screen 1: Daily Dashboard (`/`)
- **Top Bar:** Tanggal hari ini (format Indonesia, misal `Rab, 25 Nov`) di kiri, tombol icon `Settings` (atur target makro) di kanan.
- **Hero Block (Protein-First):**
  - Label `PROTEIN HARI INI` di atas.
  - Angka besar tabular: `98` `/ 130g` (warna `#245C43`), diikuti *thin linear progress bar* setinggi 6px.
  - Di bawahnya, 3 kolom ringkas dipisahkan garis vertikal tipis: **Kalori** (`1.640 / 2.200`), **Karbo** (`180 / 250g`), **Lemak** (`48 / 65g`).
- **Protein Gap Strip:** Satu baris informatif bergaya editorial (tanpa dekorasi norak): *"Kurang 32g protein — 1 dada ayam bakar atau 2 telur + tempe cukup buat nutup target."*
- **Meal Timeline:** Daftar makan hari ini yang bersih (thumbnail foto 48x48px `rounded-md`, jam makan, daftar lauk ringkas, total protein & kalori rata kanan dalam font Mono).
- **Bottom Action Dock:** Fixed di bawah dengan garis atas `1px`. Satu tombol utama dominan warna `#C84B31` (`Foto Makanan`) + satu tombol sekunder garis tipis (`Input Manual`).

### Screen 2: Guided Camera & Upload (`/scan`)
- **Viewfinder:** Full-height dark canvas (`#111110`) dengan *live camera stream* atau preview foto galeri.
- **Scale Calibration Overlay:** Garis bantu SVG tipis (`stroke-opacity: 0.6`, putih) berbentuk sudut piring + ikon siluet sendok kecil di kanan bawah dengan teks singkat: *"Ikutkan sendok atau tepi piring agar takaran akurat."*
- **Controls:** Tombol pilih galeri di kiri, tombol shutter lingkaran crisp di tengah, tombol flash/batal di kanan.

### Screen 3: Review & 1-Tap Adjustment (`/scan/review`)
- **Header Ringkas:** Foto piring (aspect 16:9 terpotong rapi) dengan badge status kalibrasi: `Terkalibrasi (Sendok)` atau `Estimasi Standar`.
- **Sticky Macro Summary Bar:** Menempel di bawah header saat di-scroll. Menampilkan total **Protein**, **Kalori**, **Karbo**, **Lemak** secara *real-time* (berubah instan saat chip porsi di-tap).
- **Detected Items List:** Setiap lauk ditampilkan dalam blok terpisah garis `1px`:
  - Baris 1: Nama lauk (`Tempe Orek`) + dropdown kecil metode masak (`Tumis Kecap`) + tombol hapus (`X`).
  - Baris 2: **1-Tap Portion Chips** (misal: `[0.5x]` `[1 sdm]` `[2 sdm (Aktif)]` `[3 sdm]`) + gramasi aktual di kanan (`60g`).
  - Baris 3 (Transparansi): Baris kecil abu-abu: `Dasar: 116 kkal, 11.4g P` • `+Minyak/Kecap: 48 kkal, 4g L`.
  - Jika `confidence < 0.7`, tampilkan *border* kiri 3px warna `#B45309` dengan label `Cek ulang porsi`.
- **Footer:** Tombol `+ Tambah Lauk Manual` (outline) dan tombol utama `Simpan ke Log Hari Ini` (`#C84B31`).

### Screen 4: Target & Database Explorer (`/settings`)
- Form bersih untuk mengatur target harian (Kalori, Protein, Karbo, Lemak) dengan preset cepat (*Cutting*, *Recomp*, *Bulking*).
- Daftar pencarian makanan TKPI lokal agar user bisa mengintip nilai nutrisi per 100g kapan saja.

## 7. Required UI States
- **Analyzing State:** Tampilkan progres bertahap: 1. *Membaca skala piring...* -> 2. *Mengidentifikasi lauk & cara masak...* -> 3. *Menghitung via database TKPI...*
- **Empty State (Belum ada log):** Tipografi bersih + pesan singkat *"Belum ada catatan makan hari ini. Foto piring pertamamu."*
- **Error State:** Jika foto buram atau API gagal, tampilkan pesan jelas dengan 2 aksi langsung: `Foto Ulang` atau `Catat Manual`.
