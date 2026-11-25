# AGENTS.md — Pedoman Arsitektur & Konvensi Repo TAKAR

Dokumen ini menjadi pegangan wajib untuk setiap sesi pengembangan aplikasi **TAKAR (Kalibrasi Makro & Protein Makanan Lokal)**.

---

## 1. Prinsip Arsitektur Utama

1. **NO AI MATH (Aturan Mutlak)**
   - Gemini Vision API (`src/lib/gemini-vision.ts`) **HANYA** boleh mengekstrak struktur fisik makanan: `raw_name`, `matched_category`, `cooking_method`, `estimated_grams`, `portion_unit_type`, `estimated_unit_qty`, `confidence`, dan `reference_object_found`.
   - Kontrak output AI wajib divalidasi dengan `VisionOutputSchema` (`src/schemas/vision-output.schema.ts`) menggunakan Zod.
   - **DILARANG** meminta atau menerima angka kalori/makronutrisi dari LLM.
   - Seluruh perhitungan kalori, protein, karbohidrat, lemak, dan *hidden oil/sauce calories* wajib dihitung secara deterministik oleh `src/lib/nutrition-engine.ts` menggunakan referensi `tkpi_foods` + `cooking_modifiers`.

2. **Instant Client-Side Recalculation (< 16ms)**
   - Saat pengguna menekan chip koreksi porsi lokal (`centong`, `potong`, `sdm`, `butir`, `mangkuk`) atau mengganti metode masak di `/scan/review`, kalkulasi ulang berjalan sinkron di sisi klien via `useMealCalculator` menggunakan `nutrition-engine.ts` tanpa memanggil ulang API Vision.

3. **Dev-Ready Zero-Key Fallback**
   - Bila `GEMINI_API_KEY` kosong di `.env.local`, `/api/analyze-meal` otomatis memanggil `src/lib/mock-fallback.ts`.
   - Bila `NEXT_PUBLIC_SUPABASE_URL` atau `NEXT_PUBLIC_SUPABASE_ANON_KEY` kosong, seluruh endpoint API (`/api/meals`, `/api/foods`, `/api/targets`) otomatis memakai in-memory/local store + sinkronisasi `localStorage` berbasis seed TKPI yang identik dengan `supabase/seed_tkpi.sql`.

4. **Camera Stream + File Input Fallback**
   - Halaman `/scan` menggunakan `navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } })` lengkap dengan panduan skala SVG (tepi piring ~24 cm & siluet sendok makan ~19 cm) serta `<input type="file" accept="image/*" capture="environment" />`.

---

## 2. Design System: Clean Soft-Minimalist Mobile App UI (Modern Fintech Card Style)

- **Canvas Background:** `#F6F8FB` (Soft Cool-White)
- **Elevated Surface:** `#FFFFFF` dengan bayangan sangat halus `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` dan minim border kaku.
- **Primary Brand & Active State:** Deep Emerald (`#1B6B4A`) dengan aksen bentuk geometris lingkaran/lengkung transparan halus (`bg-white/10`) tanpa gradasi neon/norak.
- **Secondary Action Surface:** Dark Charcoal (`#1C1E21`) dengan teks & ikon putih bersih.
- **Radius Modern:** `rounded-3xl` untuk Hero Card & Bottom Sheet, `rounded-2xl` untuk kartu item, input, dan tombol aksi.
- **Tipografi:** `Plus Jakarta Sans` untuk judul/label dan `JetBrains Mono` (`tabular-nums`) untuk seluruh angka kalori/makro/gramasi. Panah spinner bawaan browser pada `<input type="number">` wajib disembunyikan.
- **Ikonografi:** Wajib menggunakan `lucide-react` (tanpa emoji pada elemen UI).

---

## 3. Jebakan Teknis (Technical Gotchas)

- **Self-Hosted Fonts (`@fontsource-variable`)**: Gunakan `@fontsource-variable/plus-jakarta-sans` dan `@fontsource-variable/jetbrains-mono` alih-alih `next/font/google` agar `npm run build` tidak gagal pada environment tanpa koneksi ke `fonts.googleapis.com`.
- **Next.js 15 Dynamic Route Params**: Pada Next.js 15 App Router, argumen `context.params` di Route Handler (`/api/meals/[id]/route.ts`) bertipe `Promise<{ id: string }>` dan wajib di-`await`.
- **Akurasi Pembulatan Nutrisi**: Bulatkan hasil kalkulasi ke 1 desimal untuk makronutrisi (`protein_g`, `carbs_g`, `fat_g`) dan bilangan bulat untuk kilokalori (`kcal`, `hidden_kcal`).
