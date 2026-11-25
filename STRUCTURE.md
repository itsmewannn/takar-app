# PROJECT STRUCTURE: TAKAR

Ikuti struktur folder dan penamaan file berikut secara konsisten:

```text
takar-app/
├── PRD.md                              # Spesifikasi fitur & requirement MVP
├── DESIGN_SYSTEM.md                    # Token warna, tipografi, & aturan anti-AI slop
├── STRUCTURE.md                        # Peta struktur proyek ini
├── AGENTS.md                           # Aturan main repo & jebakan teknis (di-update tiap sesi)
├── .env.local                          # API keys (GEMINI_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY)
├── .env.example                        # Template env buat dokumentasi repo
├── package.json
├── next.config.ts
├── tsconfig.json                       # Strict mode aktif
├── tailwind.config.ts                  # Custom tokens (#FAF8F4, #C84B31, #245C43, dll)
├── vitest.config.ts                    # Konfigurasi unit test
│
├── supabase/
│   ├── schema.sql                      # Tabel tkpi_foods, cooking_modifiers, user_targets, meal_logs, meal_items
│   └── seed_tkpi.sql                   # Data awal 40+ lauk warteg/rumahan + tabel pengali minyak
│
└── src/
    ├── app/
    │   ├── layout.tsx                  # Setup font (Plus Jakarta Sans & JetBrains Mono) + mobile frame
    │   ├── globals.css                 # Utility tabular-nums & variabel warna dasar
    │   ├── page.tsx                    # Screen 1: Daily Dashboard (Protein Hero, Gap Advisor, Timeline)
    │   │
    │   ├── scan/
    │   │   ├── page.tsx                # Screen 2: Guided Camera & Upload + Scale Calibration Overlay
    │   │   └── review/
    │   │       └── page.tsx            # Screen 3: Review hasil scan & 1-Tap Portion Correction
    │   │
    │   ├── settings/
    │   │   └── page.tsx                # Screen 4: Target Makro Harian & Explorer Database TKPI
    │   │
    │   └── api/
    │       ├── analyze-meal/
    │       │   └── route.ts            # Endpoint terima foto -> Gemini Vision -> TKPI Matcher -> Engine
    │       ├── meals/
    │       │   ├── route.ts            # GET log hari ini & POST simpan meal_logs + meal_items
    │       │   └── [id]/
    │       │       └── route.ts        # DELETE / PATCH log makan tertentu
    │       ├── foods/
    │       │   └── route.ts            # GET pencarian manual database TKPI (buat tambah lauk manual)
    │       └── targets/
    │           └── route.ts            # GET & PUT target kalori/protein harian user
    │
    ├── components/
    │   ├── ui/                         # Komponen atomik reusable (flat, border 1px, tanpa shadow berat)
    │   │   ├── Button.tsx
    │   │   ├── Chip.tsx                # Tombol pilihan porsi (0.5, 1, 1.5 centong, dll)
    │   │   ├── ProgressBar.tsx         # Thin linear progress bar (6px)
    │   │   ├── Badge.tsx               # Status kalibrasi & warning confidence rendah
    │   │   └── EmptyState.tsx
    │   │
    │   ├── dashboard/
    │   │   ├── ProteinHeroCard.tsx     # Fokus angka Protein tabular + 3 kolom makro ringkas
    │   │   ├── ProteinGapStrip.tsx     # Rekomendasi konkret penutup kekurangan protein lokal
    │   │   ├── MealTimelineList.tsx    # Daftar log makan hari ini
    │   │   └── BottomActionDock.tsx    # Dock bawah: CTA Foto Makanan & Input Manual
    │   │
    │   ├── scan/
    │   │   ├── CameraViewfinder.tsx    # Live camera stream + fallback file upload galeri
    │   │   ├── ScaleOverlaySvg.tsx     # Garis bantu sudut piring & siluet sendok (~19cm)
    │   │   └── AnalyzingStepper.tsx    # Loading bertahap (Skala -> Lauk -> Database TKPI)
    │   │
    │   ├── review/
    │   │   ├── StickyMacroBar.tsx      # Bar total makro yang nempel & update <16ms
    │   │   ├── DetectedFoodRow.tsx     # Baris per lauk: nama, metode masak, 1-tap chips, hidden cal
    │   │   └── ManualFoodDrawer.tsx    # Modal/drawer cari & tambah lauk manual dari TKPI
    │   │
    │   └── settings/
    │       ├── TargetForm.tsx          # Form target makro + preset (Cutting / Recomp / Bulking)
    │       └── TkpiExplorerList.tsx    # Pencarian tabel nutrisi makanan lokal per 100g
    │
    ├── lib/
    │   ├── nutrition-engine.ts         # CORE: Kalkulator deterministik (Base + Hidden Calories + Konversi)
    │   ├── nutrition-engine.test.ts    # Unit test Vitest (wajib 100% hijau)
    │   ├── protein-advisor.ts          # Logika hitung sisa protein & rekomendasi lauk TKPI lokal
    │   ├── tkpi-matcher.ts             # Fuzzy/alias matching dari nama lauk AI ke tabel tkpi_foods
    │   ├── gemini-vision.ts            # Client Gemini API + System Prompt ketat + Response Schema
    │   ├── image-compressor.ts         # Kompresi foto di client (max 1024px WebP/JPEG)
    │   ├── mock-fallback.ts            # Mock response warteg otomatis kalau GEMINI_API_KEY kosong
    │   └── supabase/
    │       ├── client.ts               # Browser client Supabase
    │       └── server.ts               # Server client untuk Route Handlers & Server Components
    │
    ├── schemas/
    │   ├── vision-output.schema.ts     # Kontrak Zod ketat untuk validasi JSON dari Gemini Vision
    │   └── meal-payload.schema.ts      # Validasi Zod untuk simpan/update log makan
    │
    ├── hooks/
    │   ├── useMealCalculator.ts        # Hook client-side biar 1-tap chip langsung hitung ulang instan
    │   └── useCameraStream.ts          # Manajemen izin kamera & capture frame
    │
    └── types/
        ├── database.types.ts           # TypeScript types hasil mapping tabel Supabase
        └── nutrition.types.ts          # Interface shared: CookingMethod, PortionUnit, CalculatedItem
```
