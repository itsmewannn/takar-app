# PRD: TAKAR — Kalibrasi Makro & Protein Makanan Lokal

## 1. Product Overview
TAKAR adalah aplikasi web *mobile-first* untuk melacak kalori dan makronutrisi (fokus utama pada **Protein**) khusus makanan rumahan dan warteg Indonesia. Aplikasi ini mengatasi ketidakakuratan *calorie tracker* global dengan memisahkan tugas: **Vision AI hanya mendeteksi item, metode masak, dan estimasi gramasi berbasis referensi fisik**, sementara **perhitungan nutrisi dilakukan secara deterministik menggunakan database TKPI (Tabel Komposisi Pangan Indonesia) + pengali kalori tersembunyi (minyak/santan/kecap)**.

## 2. Target User & Core Problem
- **Target User:** Mahasiswa, pekerja muda, dan pegiat *fitness/body recomposition* di Indonesia yang makan harian di warteg, warung makan, atau masakan rumahan.
- **Core Problem:** Sulit menghitung gramasi dan *hidden calories* (minyak goreng, bumbu balado, santan) dari sepiring lauk campur tanpa menimbang manual.
- **Success Metric (MVP):** User bisa memfoto piring, mengoreksi porsi dengan 1-tap, dan menyimpan log nutrisi dalam waktu **< 25 detik**.

## 3. Tech Stack (Wajib)
- **Framework:** Next.js 15 (App Router) + TypeScript (Strict mode)
- **Styling:** Tailwind CSS + Lucide Icons
- **Database & Auth:** Supabase (PostgreSQL)
- **AI Vision:** Gemini API (Structured JSON Output / `responseSchema`)
- **Validation:** Zod (untuk validasi kontrak JSON dari Vision AI)
- **Testing:** Vitest

## 4. Functional Requirements (MVP Scope)

### F1: Guided Capture & Scale Calibration
- User dapat mengambil foto via kamera HP atau upload dari galeri.
- Layar kamera menampilkan *overlay* panduan visual ringan: instruksi meletakkan sendok makan standar (~19 cm) atau memperlihatkan pinggiran piring (~24 cm) sebagai referensi skala.
- Kompresi gambar otomatis di sisi klien (max 1024px, WebP/JPEG) sebelum dikirim ke API untuk menghemat *latency* dan kuota.

### F2: Structured Vision AI Extraction (No AI Math)
- API route `/api/analyze-meal` mengirim gambar ke Gemini Vision dengan *system prompt* ketat dan *JSON schema*.
- **Aturan Mutlak:** AI **DILARANG** menghitung atau mengembalikan angka kalori/protein.
- AI hanya mengembalikan array `detected_items`:
  - `raw_name`: string (nama lauk dalam Bahasa Indonesia, misal "tempe orek", "telur balado")
  - `matched_category`: enum (`karbo`, `protein_hewani`, `protein_nabati`, `sayur`, `sambal_pelengkap`)
  - `cooking_method`: enum (`kukus_rebus`, `panggang`, `tumis`, `goreng`, `goreng_tepung`, `balado`, `santan`, `kecap_manis`)
  - `estimated_grams`: number
  - `portion_unit_type`: enum (`centong`, `potong`, `sdm`, `butir`, `mangkuk`)
  - `estimated_unit_qty`: number (misal: `1.5` centong, `1` potong)
  - `confidence`: number (0.0 - 1.0)
  - `reference_object_found`: boolean (apakah sendok/pinggiran piring terdeteksi)

### F3: TKPI Grounding & Deterministic Calculation Engine
- Backend mencocokkan `raw_name` ke tabel `tkpi_foods` (menggunakan *alias matching* / *fuzzy search* trigram atau fallback kategori).
- Rumus dasar per item (pure TypeScript function, unit-tested):
  - `base_macro = (grams / 100) * tkpi_per_100g`
- Pengali **Hidden Calories** dari tabel `cooking_modifiers` berdasarkan `cooking_method`:
  - `kukus_rebus` / `panggang`: +0g lemak, +0g karbo
  - `tumis`: +4g lemak per 100g bahan
  - `goreng` / `balado`: +9g lemak per 100g bahan
  - `goreng_tepung`: +12g lemak, +10g karbo per 100g bahan
  - `santan`: +8g lemak per 100g bahan
  - `kecap_manis`: +4g lemak, +6g karbo per 100g bahan
- Output akhir memisahkan **Base Macro** dan **Hidden Oil/Sauce Macro** secara transparan agar user paham kenapa kalorinya sekian.

### F4: 1-Tap Local Portion Correction (Human-in-the-Loop)
- Di halaman review hasil scan, setiap lauk menampilkan tombol *chip* satuan lokal sesuai `portion_unit_type`:
  - `centong`: `0.5` | `1` | `1.5` | `2` (1 centong nasi = 100g)
  - `potong`: `Kecil (0.7x)` | `Sedang (1x)` | `Besar (1.4x)`
  - `sdm`: `1 sdm` | `2 sdm` | `3 sdm`
  - `butir`: `0.5` | `1` | `2`
- Saat user menekan chip atau mengubah metode masak, total kalori, protein, karbo, dan lemak **dihitung ulang instan di client-side (< 16ms)** tanpa memanggil ulang API AI.
- User dapat menghapus item yang salah deteksi atau menambah item manual dari pencarian database TKPI.

### F5: Daily Tracking & Protein Gap Advisor
- User dapat mengatur target harian (default: Kalori 2200 kkal, Protein 130g, Karbo 250g, Lemak 65g).
- Dashboard menghitung sisa target hari ini dan menampilkan **Protein Gap Advisor**: rekomendasi konkret berbasis makanan lokal dari database TKPI jika protein masih kurang (contoh: *"Kurang 32g protein lagi -> Tambah 100g dada ayam bakar (+31g P) atau 2 butir telur rebus + 100g tempe (+31g P)"*).

## 5. Database Schema (Supabase SQL)
1. `tkpi_foods`: `id`, `name`, `aliases` (text[]), `category`, `kcal_per_100g`, `protein_per_100g`, `carbs_per_100g`, `fat_per_100g`, `default_unit_type`, `grams_per_unit`. (Seed awal minimal 40 makanan warteg/lokal populer).
2. `cooking_modifiers`: `method_key` (PK), `label`, `extra_fat_per_100g`, `extra_carbs_per_100g`, `extra_kcal_per_100g`.
3. `user_targets`: `id`, `daily_kcal`, `daily_protein_g`, `daily_carbs_g`, `daily_fat_g`.
4. `meal_logs`: `id`, `logged_at`, `meal_type`, `image_url`, `total_kcal`, `total_protein_g`, `total_carbs_g`, `total_fat_g`, `reference_calibrated` (boolean).
5. `meal_items`: `id`, `meal_log_id` (FK), `tkpi_food_id` (FK), `display_name`, `cooking_method`, `grams`, `kcal`, `protein_g`, `carbs_g`, `fat_g`, `hidden_kcal`.

## 6. Acceptance Criteria (Definition of Done)
- Kalkulator makro deterministik memiliki unit test (Vitest) dengan 100% pass rate untuk semua `cooking_method`.
- Jika Vision AI mengembalikan JSON rusak atau timeout, aplikasi menampilkan *fallback state* yang rapi dan memungkinkan input manual.
- Tidak ada angka nutrisi yang dihitung oleh LLM; seluruh angka berasal dari `tkpi_foods` + `cooking_modifiers`.
- Build Next.js (`npm run build`) dan TypeScript check (`npx tsc --noEmit`) bebas error.
