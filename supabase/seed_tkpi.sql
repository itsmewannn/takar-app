-- ============================================================================
-- TAKAR — Seed Data: Cooking Modifiers & 48 Makanan Lokal/Warteg (TKPI)
-- Catatan: Nilai nutrisi tkpi_foods adalah nilai bahan dasar (sebelum minyak/santan
-- tambahan), sehingga tidak terjadi double-counting saat digabung cooking_modifiers.
-- ============================================================================

-- 1. Seed Cooking Modifiers (sesuai spesifikasi PRD F3)
INSERT INTO cooking_modifiers (method_key, label, extra_fat_per_100g, extra_carbs_per_100g, extra_kcal_per_100g)
VALUES
  ('kukus_rebus',   'Kukus / Rebus',  0.0,  0.0,   0.0),
  ('panggang',      'Bakar / Panggang', 0.0, 0.0,  0.0),
  ('tumis',         'Tumis',          4.0,  0.0,  36.0),
  ('goreng',        'Goreng',         9.0,  0.0,  81.0),
  ('balado',        'Balado / Sambal', 9.0, 0.0,  81.0),
  ('goreng_tepung', 'Goreng Tepung', 12.0, 10.0, 148.0),
  ('santan',        'Kuah Santan',    8.0,  0.0,  72.0),
  ('kecap_manis',   'Masak Kecap',    4.0,  6.0,  60.0)
ON CONFLICT (method_key) DO UPDATE SET
  label = EXCLUDED.label,
  extra_fat_per_100g = EXCLUDED.extra_fat_per_100g,
  extra_carbs_per_100g = EXCLUDED.extra_carbs_per_100g,
  extra_kcal_per_100g = EXCLUDED.extra_kcal_per_100g;

-- 2. Seed 48 Makanan Lokal / Warteg Indonesia (Mengacu TKPI per 100g bagian dapat dimakan)
INSERT INTO tkpi_foods (
  id, name, aliases, category,
  kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g,
  default_unit_type, grams_per_unit
)
VALUES
  -- ======================== KARBOHIDRAT (10 item) ========================
  ('nasi-putih', 'Nasi Putih', ARRAY['nasi', 'nasi beras putih', 'nasi warteg', 'nasi hangat'], 'karbo', 130.0, 2.4, 28.6, 0.2, 'centong', 100.0),
  ('nasi-merah', 'Nasi Merah', ARRAY['nasi beras merah', 'beras merah'], 'karbo', 110.0, 2.6, 23.0, 0.9, 'centong', 100.0),
  ('nasi-uduk', 'Nasi Uduk', ARRAY['nasi gurih', 'nasi santan'], 'karbo', 168.0, 3.0, 29.5, 4.2, 'centong', 100.0),
  ('nasi-kuning', 'Nasi Kuning', ARRAY['nasi tumpeng', 'nasi kunyit'], 'karbo', 165.0, 3.1, 29.0, 4.0, 'centong', 100.0),
  ('lontong', 'Lontong / Ketupat', ARRAY['ketupat', 'lontong daun', 'kupat'], 'karbo', 144.0, 2.8, 31.8, 0.3, 'potong', 100.0),
  ('bubur-ayam-polos', 'Bubur Nasi', ARRAY['bubur putih', 'bubur beras', 'bubur ayam'], 'karbo', 72.0, 1.5, 15.6, 0.2, 'mangkuk', 240.0),
  ('mie-kuning', 'Mie Kuning Basah', ARRAY['mie goreng', 'bakmi', 'mie telur', 'mie rebus'], 'karbo', 141.0, 4.7, 28.0, 1.1, 'mangkuk', 150.0),
  ('bihun', 'Bihun Jagung / Beras', ARRAY['bihun goreng', 'bihun rebus', 'soun'], 'karbo', 109.0, 0.9, 25.5, 0.2, 'sdm', 35.0),
  ('kentang', 'Kentang', ARRAY['kentang balado', 'kentang mustofa', 'sambal goreng kentang', 'kentang rebus'], 'karbo', 87.0, 2.0, 20.1, 0.1, 'sdm', 35.0),
  ('singkong', 'Singkong', ARRAY['singkong goreng', 'singkong rebus', 'ubi kayu'], 'karbo', 154.0, 1.2, 36.8, 0.3, 'potong', 80.0),

  -- ======================== PROTEIN HEWANI (16 item) ========================
  ('dada-ayam', 'Dada Ayam (Tanpa Kulit)', ARRAY['ayam dada', 'dada ayam bakar', 'dada ayam goreng', 'ayam suwir', 'fillet ayam'], 'protein_hewani', 165.0, 31.0, 0.0, 3.6, 'potong', 100.0),
  ('paha-ayam', 'Paha Ayam', ARRAY['ayam goreng', 'ayam bakar', 'ayam serundeng', 'ayam lengkuas', 'ayam opor', 'ayam gulai', 'ayam kecap', 'paha atas', 'paha bawah'], 'protein_hewani', 209.0, 25.0, 0.0, 11.5, 'potong', 90.0),
  ('ayam-geprek-fillet', 'Ayam Fillet Crispy (Bahan Dasar)', ARRAY['ayam geprek', 'ayam crispy', 'ayam tepung', 'chicken katsu'], 'protein_hewani', 175.0, 27.5, 0.0, 6.5, 'potong', 95.0),
  ('ati-ampela-ayam', 'Ati Ampela Ayam', ARRAY['hati ayam', 'ampela ayam', 'sambal goreng ati', 'ati ampela'], 'protein_hewani', 146.0, 21.2, 1.0, 5.8, 'potong', 60.0),
  ('telur-ayam', 'Telur Ayam', ARRAY['telur rebus', 'telur balado', 'telur ceplok', 'telur mata sapi', 'telur semur', 'telur kecap', 'telur pindang'], 'protein_hewani', 155.0, 12.6, 1.1, 10.6, 'butir', 55.0),
  ('telur-dadar', 'Telur Dadar Warteg (Bahan Dasar)', ARRAY['dadar telur', 'telur dadar padang', 'omelet'], 'protein_hewani', 162.0, 11.8, 2.5, 11.4, 'potong', 65.0),
  ('telur-puyuh', 'Telur Puyuh', ARRAY['sate telur puyuh', 'telur puyuh bacem', 'telur puyuh balado'], 'protein_hewani', 158.0, 13.1, 0.4, 11.1, 'butir', 11.0),
  ('ikan-tongkol', 'Ikan Tongkol', ARRAY['tongkol balado', 'tongkol suwir', 'pindang tongkol', 'ikan pindang'], 'protein_hewani', 135.0, 24.0, 0.0, 3.5, 'potong', 75.0),
  ('ikan-kembung', 'Ikan Kembung', ARRAY['kembung goreng', 'kembung bakar', 'ikan pesmol', 'ikan banjar'], 'protein_hewani', 125.0, 21.3, 0.0, 3.8, 'potong', 85.0),
  ('ikan-lele', 'Ikan Lele', ARRAY['pecel lele', 'lele goreng', 'lele bakar', 'mangut lele'], 'protein_hewani', 105.0, 18.2, 0.0, 3.1, 'potong', 90.0),
  ('ikan-nila-mujair', 'Ikan Nila / Mujair', ARRAY['ikan nila', 'ikan mujair', 'nila goreng', 'nila bakar'], 'protein_hewani', 112.0, 20.1, 0.0, 2.8, 'potong', 100.0),
  ('ikan-bandeng', 'Ikan Bandeng', ARRAY['bandeng presto', 'bandeng goreng'], 'protein_hewani', 129.0, 20.0, 0.0, 4.8, 'potong', 85.0),
  ('ikan-teri', 'Ikan Teri Nasi / Tawar', ARRAY['teri kacang', 'sambal teri', 'teri medan', 'teri goreng'], 'protein_hewani', 170.0, 33.4, 0.0, 3.3, 'sdm', 20.0),
  ('daging-sapi', 'Daging Sapi', ARRAY['rendang sapi', 'rendang', 'empal sapi', 'semur daging', 'sapi lada hitam', 'dendeng'], 'protein_hewani', 207.0, 26.0, 0.0, 11.0, 'potong', 70.0),
  ('cumi-cumi', 'Cumi-Cumi', ARRAY['cumi hitam', 'cumi asin', 'sambal cumi', 'cumi tepung'], 'protein_hewani', 92.0, 16.8, 1.5, 1.4, 'sdm', 35.0),
  ('udang', 'Udang Kupas', ARRAY['udang balado', 'udang goreng', 'udang tepung', 'udang asam manis'], 'protein_hewani', 99.0, 21.0, 0.2, 1.1, 'sdm', 35.0),

  -- ======================== PROTEIN NABATI (7 item) ========================
  ('tempe-kedelai', 'Tempe Kedelai', ARRAY['tempe goreng', 'tempe mendoan', 'tempe bacem', 'tempe bakar', 'tempe kukus', 'tempe'], 'protein_nabati', 193.0, 19.0, 12.7, 7.7, 'potong', 50.0),
  ('tempe-orek', 'Tempe Orek (Potong Kecil)', ARRAY['orek tempe', 'kering tempe', 'orek tempe basah', 'sambal goreng tempe'], 'protein_nabati', 193.0, 19.0, 12.7, 7.7, 'sdm', 30.0),
  ('tahu-putih', 'Tahu Putih / Kuning', ARRAY['tahu goreng', 'tahu bacem', 'tahu isi', 'tahu semur', 'tahu kukus', 'tahu'], 'protein_nabati', 80.0, 10.9, 0.8, 4.7, 'potong', 55.0),
  ('oncom', 'Oncom', ARRAY['tumis oncom', 'oncom leunca', 'oncom goreng'], 'protein_nabati', 187.0, 13.0, 22.6, 6.0, 'sdm', 30.0),
  ('kacang-tanah', 'Kacang Tanah Kupas', ARRAY['kacang goreng', 'teri kacang tanah'], 'protein_nabati', 567.0, 25.8, 16.1, 49.2, 'sdm', 15.0),
  ('kacang-panjang-tempe', 'Tempe & Kacang Panjang', ARRAY['oseng kacang tempe', 'sambal goreng kacang tempe'], 'protein_nabati', 118.0, 10.8, 10.2, 4.0, 'sdm', 35.0),
  ('edamame-kedelai', 'Kedelai Rebus / Edamame', ARRAY['edamame', 'kacang kedelai'], 'protein_nabati', 121.0, 11.9, 8.9, 5.2, 'sdm', 30.0),

  -- ======================== SAYUR (10 item) ========================
  ('kangkung', 'Sayur Kangkung', ARRAY['tumis kangkung', 'cah kangkung', 'plecing kangkung'], 'sayur', 29.0, 3.0, 5.4, 0.3, 'sdm', 35.0),
  ('bayam', 'Sayur Bayam Bening', ARRAY['sayur bening', 'bayam jagung', 'bayam rebus'], 'sayur', 23.0, 2.9, 3.6, 0.4, 'mangkuk', 150.0),
  ('tauge', 'Tauge / Kecambah', ARRAY['tumis toge', 'tumis tauge', 'toge tahu', 'cah tauge'], 'sayur', 37.0, 4.4, 4.8, 0.5, 'sdm', 30.0),
  ('capcay-sayur', 'Capcay Sayuran', ARRAY['capcay', 'capcay kuah', 'capcay goreng', 'tumis sayur campur'], 'sayur', 42.0, 2.4, 7.2, 0.6, 'sdm', 40.0),
  ('sayur-sop', 'Sayur Sop Warteg', ARRAY['sop sayur', 'sup sayuran', 'sop wortel kentang'], 'sayur', 35.0, 1.6, 6.8, 0.4, 'mangkuk', 180.0),
  ('sayur-asem', 'Sayur Asem', ARRAY['kuah sayur asem', 'sayur asam'], 'sayur', 38.0, 1.8, 7.5, 0.5, 'mangkuk', 180.0),
  ('sayur-lodeh', 'Sayur Lodeh (Bahan Sayur)', ARRAY['lodeh', 'sayur nangka santan'], 'sayur', 44.0, 2.0, 8.1, 0.7, 'mangkuk', 160.0),
  ('daun-singkong', 'Daun Singkong', ARRAY['gulai daun singkong', 'daun singkong rebus', 'urap daun singkong'], 'sayur', 37.0, 3.7, 7.1, 0.6, 'sdm', 35.0),
  ('terong', 'Terong Ungu', ARRAY['terong balado', 'terong kecap', 'terong goreng'], 'sayur', 28.0, 1.1, 5.5, 0.2, 'potong', 60.0),
  ('buncis-wortel', 'Buncis & Wortel', ARRAY['tumis buncis', 'oseng buncis', 'urap sayur', 'pecel sayur'], 'sayur', 34.0, 1.9, 7.0, 0.2, 'sdm', 35.0),

  -- ======================== SAMBAL & PELENGKAP (5 item) ========================
  ('perkedel-kentang', 'Perkedel Kentang (Adonan Dasar)', ARRAY['perkedel', 'begedel'], 'sambal_pelengkap', 112.0, 3.2, 21.0, 1.8, 'potong', 45.0),
  ('bakwan-sayur', 'Bakwan Sayur / Bala-Bala (Adonan Dasar)', ARRAY['bakwan', 'bala-bala', 'ote-ote', 'bakwan jagung'], 'sambal_pelengkap', 138.0, 3.8, 26.5, 1.6, 'potong', 50.0),
  ('sambal-merah', 'Sambal Cabai (Mentah/Dasar)', ARRAY['sambal terasi', 'sambal bawang', 'sambal korek', 'sambal tomat', 'sambal warteg'], 'sambal_pelengkap', 48.0, 1.6, 9.8, 0.6, 'sdm', 15.0),
  ('sambal-ijo', 'Sambal Cabai Hijau (Dasar)', ARRAY['sambal hijau', 'cabe ijo', 'sambal padang'], 'sambal_pelengkap', 44.0, 1.4, 9.2, 0.5, 'sdm', 15.0),
  ('kerupuk-putih', 'Kerupuk Kaleng / Udang (Siap Makan)', ARRAY['kerupuk', 'kerupuk putih', 'kerupuk udang', 'emping'], 'sambal_pelengkap', 476.0, 5.2, 68.4, 20.5, 'potong', 15.0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  aliases = EXCLUDED.aliases,
  category = EXCLUDED.category,
  kcal_per_100g = EXCLUDED.kcal_per_100g,
  protein_per_100g = EXCLUDED.protein_per_100g,
  carbs_per_100g = EXCLUDED.carbs_per_100g,
  fat_per_100g = EXCLUDED.fat_per_100g,
  default_unit_type = EXCLUDED.default_unit_type,
  grams_per_unit = EXCLUDED.grams_per_unit;
