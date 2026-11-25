import { VisionOutputSchema, type VisionOutput } from "@/schemas/vision-output.schema";
import type {
  MealItemRow,
  MealLogWithItems,
  UserTargetRow,
} from "@/types/database.types";
import type { TkpiFood } from "@/types/nutrition.types";
import type {
  CreateMealPayload,
  UpdateMealPayload,
  UserTargetPayload,
} from "@/schemas/meal-payload.schema";

/**
 * Dataset lokal 48 makanan warteg/rumahan Indonesia (identik dengan supabase/seed_tkpi.sql).
 * Dipakai untuk pencocokan TKPI deterministik & dev-ready fallback ketika Supabase belum diisi.
 */
export const DEFAULT_TKPI_FOODS: TkpiFood[] = [
  // KARBOHIDRAT (10)
  {
    id: "nasi-putih",
    name: "Nasi Putih",
    aliases: ["nasi", "nasi beras putih", "nasi warteg", "nasi hangat"],
    category: "karbo",
    kcal_per_100g: 130.0,
    protein_per_100g: 2.4,
    carbs_per_100g: 28.6,
    fat_per_100g: 0.2,
    default_unit_type: "centong",
    grams_per_unit: 100.0,
  },
  {
    id: "nasi-merah",
    name: "Nasi Merah",
    aliases: ["nasi beras merah", "beras merah"],
    category: "karbo",
    kcal_per_100g: 110.0,
    protein_per_100g: 2.6,
    carbs_per_100g: 23.0,
    fat_per_100g: 0.9,
    default_unit_type: "centong",
    grams_per_unit: 100.0,
  },
  {
    id: "nasi-uduk",
    name: "Nasi Uduk",
    aliases: ["nasi gurih", "nasi santan"],
    category: "karbo",
    kcal_per_100g: 168.0,
    protein_per_100g: 3.0,
    carbs_per_100g: 29.5,
    fat_per_100g: 4.2,
    default_unit_type: "centong",
    grams_per_unit: 100.0,
  },
  {
    id: "nasi-kuning",
    name: "Nasi Kuning",
    aliases: ["nasi tumpeng", "nasi kunyit"],
    category: "karbo",
    kcal_per_100g: 165.0,
    protein_per_100g: 3.1,
    carbs_per_100g: 29.0,
    fat_per_100g: 4.0,
    default_unit_type: "centong",
    grams_per_unit: 100.0,
  },
  {
    id: "lontong",
    name: "Lontong / Ketupat",
    aliases: ["ketupat", "lontong daun", "kupat"],
    category: "karbo",
    kcal_per_100g: 144.0,
    protein_per_100g: 2.8,
    carbs_per_100g: 31.8,
    fat_per_100g: 0.3,
    default_unit_type: "potong",
    grams_per_unit: 100.0,
  },
  {
    id: "bubur-ayam-polos",
    name: "Bubur Nasi",
    aliases: ["bubur putih", "bubur beras", "bubur ayam"],
    category: "karbo",
    kcal_per_100g: 72.0,
    protein_per_100g: 1.5,
    carbs_per_100g: 15.6,
    fat_per_100g: 0.2,
    default_unit_type: "mangkuk",
    grams_per_unit: 240.0,
  },
  {
    id: "mie-kuning",
    name: "Mie Kuning Basah",
    aliases: ["mie goreng", "bakmi", "mie telur", "mie rebus"],
    category: "karbo",
    kcal_per_100g: 141.0,
    protein_per_100g: 4.7,
    carbs_per_100g: 28.0,
    fat_per_100g: 1.1,
    default_unit_type: "mangkuk",
    grams_per_unit: 150.0,
  },
  {
    id: "bihun",
    name: "Bihun Jagung / Beras",
    aliases: ["bihun goreng", "bihun rebus", "soun"],
    category: "karbo",
    kcal_per_100g: 109.0,
    protein_per_100g: 0.9,
    carbs_per_100g: 25.5,
    fat_per_100g: 0.2,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },
  {
    id: "kentang",
    name: "Kentang",
    aliases: [
      "kentang balado",
      "kentang mustofa",
      "sambal goreng kentang",
      "kentang rebus",
    ],
    category: "karbo",
    kcal_per_100g: 87.0,
    protein_per_100g: 2.0,
    carbs_per_100g: 20.1,
    fat_per_100g: 0.1,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },
  {
    id: "singkong",
    name: "Singkong",
    aliases: ["singkong goreng", "singkong rebus", "ubi kayu"],
    category: "karbo",
    kcal_per_100g: 154.0,
    protein_per_100g: 1.2,
    carbs_per_100g: 36.8,
    fat_per_100g: 0.3,
    default_unit_type: "potong",
    grams_per_unit: 80.0,
  },

  // PROTEIN HEWANI (16)
  {
    id: "dada-ayam",
    name: "Dada Ayam (Tanpa Kulit)",
    aliases: [
      "ayam dada",
      "dada ayam bakar",
      "dada ayam goreng",
      "ayam suwir",
      "fillet ayam",
    ],
    category: "protein_hewani",
    kcal_per_100g: 165.0,
    protein_per_100g: 31.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.6,
    default_unit_type: "potong",
    grams_per_unit: 100.0,
  },
  {
    id: "paha-ayam",
    name: "Paha Ayam",
    aliases: [
      "ayam goreng",
      "ayam bakar",
      "ayam serundeng",
      "ayam lengkuas",
      "ayam opor",
      "ayam gulai",
      "ayam kecap",
      "paha atas",
      "paha bawah",
    ],
    category: "protein_hewani",
    kcal_per_100g: 209.0,
    protein_per_100g: 25.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 11.5,
    default_unit_type: "potong",
    grams_per_unit: 90.0,
  },
  {
    id: "ayam-geprek-fillet",
    name: "Ayam Fillet Crispy (Bahan Dasar)",
    aliases: ["ayam geprek", "ayam crispy", "ayam tepung", "chicken katsu"],
    category: "protein_hewani",
    kcal_per_100g: 175.0,
    protein_per_100g: 27.5,
    carbs_per_100g: 0.0,
    fat_per_100g: 6.5,
    default_unit_type: "potong",
    grams_per_unit: 95.0,
  },
  {
    id: "ati-ampela-ayam",
    name: "Ati Ampela Ayam",
    aliases: ["hati ayam", "ampela ayam", "sambal goreng ati", "ati ampela"],
    category: "protein_hewani",
    kcal_per_100g: 146.0,
    protein_per_100g: 21.2,
    carbs_per_100g: 1.0,
    fat_per_100g: 5.8,
    default_unit_type: "potong",
    grams_per_unit: 60.0,
  },
  {
    id: "telur-ayam",
    name: "Telur Ayam",
    aliases: [
      "telur rebus",
      "telur balado",
      "telur ceplok",
      "telur mata sapi",
      "telur semur",
      "telur kecap",
      "telur pindang",
    ],
    category: "protein_hewani",
    kcal_per_100g: 155.0,
    protein_per_100g: 12.6,
    carbs_per_100g: 1.1,
    fat_per_100g: 10.6,
    default_unit_type: "butir",
    grams_per_unit: 55.0,
  },
  {
    id: "telur-dadar",
    name: "Telur Dadar Warteg (Bahan Dasar)",
    aliases: ["dadar telur", "telur dadar padang", "omelet"],
    category: "protein_hewani",
    kcal_per_100g: 162.0,
    protein_per_100g: 11.8,
    carbs_per_100g: 2.5,
    fat_per_100g: 11.4,
    default_unit_type: "potong",
    grams_per_unit: 65.0,
  },
  {
    id: "telur-puyuh",
    name: "Telur Puyuh",
    aliases: ["sate telur puyuh", "telur puyuh bacem", "telur puyuh balado"],
    category: "protein_hewani",
    kcal_per_100g: 158.0,
    protein_per_100g: 13.1,
    carbs_per_100g: 0.4,
    fat_per_100g: 11.1,
    default_unit_type: "butir",
    grams_per_unit: 11.0,
  },
  {
    id: "ikan-tongkol",
    name: "Ikan Tongkol",
    aliases: [
      "tongkol balado",
      "tongkol suwir",
      "pindang tongkol",
      "ikan pindang",
    ],
    category: "protein_hewani",
    kcal_per_100g: 135.0,
    protein_per_100g: 24.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.5,
    default_unit_type: "potong",
    grams_per_unit: 75.0,
  },
  {
    id: "ikan-kembung",
    name: "Ikan Kembung",
    aliases: ["kembung goreng", "kembung bakar", "ikan pesmol", "ikan banjar"],
    category: "protein_hewani",
    kcal_per_100g: 125.0,
    protein_per_100g: 21.3,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.8,
    default_unit_type: "potong",
    grams_per_unit: 85.0,
  },
  {
    id: "ikan-lele",
    name: "Ikan Lele",
    aliases: ["pecel lele", "lele goreng", "lele bakar", "mangut lele"],
    category: "protein_hewani",
    kcal_per_100g: 105.0,
    protein_per_100g: 18.2,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.1,
    default_unit_type: "potong",
    grams_per_unit: 90.0,
  },
  {
    id: "ikan-nila-mujair",
    name: "Ikan Nila / Mujair",
    aliases: ["ikan nila", "ikan mujair", "nila goreng", "nila bakar"],
    category: "protein_hewani",
    kcal_per_100g: 112.0,
    protein_per_100g: 20.1,
    carbs_per_100g: 0.0,
    fat_per_100g: 2.8,
    default_unit_type: "potong",
    grams_per_unit: 100.0,
  },
  {
    id: "ikan-bandeng",
    name: "Ikan Bandeng",
    aliases: ["bandeng presto", "bandeng goreng"],
    category: "protein_hewani",
    kcal_per_100g: 129.0,
    protein_per_100g: 20.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 4.8,
    default_unit_type: "potong",
    grams_per_unit: 85.0,
  },
  {
    id: "ikan-teri",
    name: "Ikan Teri Nasi / Tawar",
    aliases: ["teri kacang", "sambal teri", "teri medan", "teri goreng"],
    category: "protein_hewani",
    kcal_per_100g: 170.0,
    protein_per_100g: 33.4,
    carbs_per_100g: 0.0,
    fat_per_100g: 3.3,
    default_unit_type: "sdm",
    grams_per_unit: 20.0,
  },
  {
    id: "daging-sapi",
    name: "Daging Sapi",
    aliases: [
      "rendang sapi",
      "rendang",
      "empal sapi",
      "semur daging",
      "sapi lada hitam",
      "dendeng",
    ],
    category: "protein_hewani",
    kcal_per_100g: 207.0,
    protein_per_100g: 26.0,
    carbs_per_100g: 0.0,
    fat_per_100g: 11.0,
    default_unit_type: "potong",
    grams_per_unit: 70.0,
  },
  {
    id: "cumi-cumi",
    name: "Cumi-Cumi",
    aliases: ["cumi hitam", "cumi asin", "sambal cumi", "cumi tepung"],
    category: "protein_hewani",
    kcal_per_100g: 92.0,
    protein_per_100g: 16.8,
    carbs_per_100g: 1.5,
    fat_per_100g: 1.4,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },
  {
    id: "udang",
    name: "Udang Kupas",
    aliases: ["udang balado", "udang goreng", "udang tepung", "udang asam manis"],
    category: "protein_hewani",
    kcal_per_100g: 99.0,
    protein_per_100g: 21.0,
    carbs_per_100g: 0.2,
    fat_per_100g: 1.1,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },

  // PROTEIN NABATI (7)
  {
    id: "tempe-kedelai",
    name: "Tempe Kedelai",
    aliases: [
      "tempe goreng",
      "tempe mendoan",
      "tempe bacem",
      "tempe bakar",
      "tempe kukus",
      "tempe",
    ],
    category: "protein_nabati",
    kcal_per_100g: 193.0,
    protein_per_100g: 19.0,
    carbs_per_100g: 12.7,
    fat_per_100g: 7.7,
    default_unit_type: "potong",
    grams_per_unit: 50.0,
  },
  {
    id: "tempe-orek",
    name: "Tempe Orek (Potong Kecil)",
    aliases: [
      "orek tempe",
      "kering tempe",
      "orek tempe basah",
      "sambal goreng tempe",
    ],
    category: "protein_nabati",
    kcal_per_100g: 193.0,
    protein_per_100g: 19.0,
    carbs_per_100g: 12.7,
    fat_per_100g: 7.7,
    default_unit_type: "sdm",
    grams_per_unit: 30.0,
  },
  {
    id: "tahu-putih",
    name: "Tahu Putih / Kuning",
    aliases: [
      "tahu goreng",
      "tahu bacem",
      "tahu isi",
      "tahu semur",
      "tahu kukus",
      "tahu",
    ],
    category: "protein_nabati",
    kcal_per_100g: 80.0,
    protein_per_100g: 10.9,
    carbs_per_100g: 0.8,
    fat_per_100g: 4.7,
    default_unit_type: "potong",
    grams_per_unit: 55.0,
  },
  {
    id: "oncom",
    name: "Oncom",
    aliases: ["tumis oncom", "oncom leunca", "oncom goreng"],
    category: "protein_nabati",
    kcal_per_100g: 187.0,
    protein_per_100g: 13.0,
    carbs_per_100g: 22.6,
    fat_per_100g: 6.0,
    default_unit_type: "sdm",
    grams_per_unit: 30.0,
  },
  {
    id: "kacang-tanah",
    name: "Kacang Tanah Kupas",
    aliases: ["kacang goreng", "teri kacang tanah"],
    category: "protein_nabati",
    kcal_per_100g: 567.0,
    protein_per_100g: 25.8,
    carbs_per_100g: 16.1,
    fat_per_100g: 49.2,
    default_unit_type: "sdm",
    grams_per_unit: 15.0,
  },
  {
    id: "kacang-panjang-tempe",
    name: "Tempe & Kacang Panjang",
    aliases: ["oseng kacang tempe", "sambal goreng kacang tempe"],
    category: "protein_nabati",
    kcal_per_100g: 118.0,
    protein_per_100g: 10.8,
    carbs_per_100g: 10.2,
    fat_per_100g: 4.0,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },
  {
    id: "edamame-kedelai",
    name: "Kedelai Rebus / Edamame",
    aliases: ["edamame", "kacang kedelai"],
    category: "protein_nabati",
    kcal_per_100g: 121.0,
    protein_per_100g: 11.9,
    carbs_per_100g: 8.9,
    fat_per_100g: 5.2,
    default_unit_type: "sdm",
    grams_per_unit: 30.0,
  },

  // SAYUR (10)
  {
    id: "kangkung",
    name: "Sayur Kangkung",
    aliases: ["tumis kangkung", "cah kangkung", "plecing kangkung"],
    category: "sayur",
    kcal_per_100g: 29.0,
    protein_per_100g: 3.0,
    carbs_per_100g: 5.4,
    fat_per_100g: 0.3,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },
  {
    id: "bayam",
    name: "Sayur Bayam Bening",
    aliases: ["sayur bening", "bayam jagung", "bayam rebus"],
    category: "sayur",
    kcal_per_100g: 23.0,
    protein_per_100g: 2.9,
    carbs_per_100g: 3.6,
    fat_per_100g: 0.4,
    default_unit_type: "mangkuk",
    grams_per_unit: 150.0,
  },
  {
    id: "tauge",
    name: "Tauge / Kecambah",
    aliases: ["tumis toge", "tumis tauge", "toge tahu", "cah tauge"],
    category: "sayur",
    kcal_per_100g: 37.0,
    protein_per_100g: 4.4,
    carbs_per_100g: 4.8,
    fat_per_100g: 0.5,
    default_unit_type: "sdm",
    grams_per_unit: 30.0,
  },
  {
    id: "capcay-sayur",
    name: "Capcay Sayuran",
    aliases: ["capcay", "capcay kuah", "capcay goreng", "tumis sayur campur"],
    category: "sayur",
    kcal_per_100g: 42.0,
    protein_per_100g: 2.4,
    carbs_per_100g: 7.2,
    fat_per_100g: 0.6,
    default_unit_type: "sdm",
    grams_per_unit: 40.0,
  },
  {
    id: "sayur-sop",
    name: "Sayur Sop Warteg",
    aliases: ["sop sayur", "sup sayuran", "sop wortel kentang"],
    category: "sayur",
    kcal_per_100g: 35.0,
    protein_per_100g: 1.6,
    carbs_per_100g: 6.8,
    fat_per_100g: 0.4,
    default_unit_type: "mangkuk",
    grams_per_unit: 180.0,
  },
  {
    id: "sayur-asem",
    name: "Sayur Asem",
    aliases: ["kuah sayur asem", "sayur asam"],
    category: "sayur",
    kcal_per_100g: 38.0,
    protein_per_100g: 1.8,
    carbs_per_100g: 7.5,
    fat_per_100g: 0.5,
    default_unit_type: "mangkuk",
    grams_per_unit: 180.0,
  },
  {
    id: "sayur-lodeh",
    name: "Sayur Lodeh (Bahan Sayur)",
    aliases: ["lodeh", "sayur nangka santan"],
    category: "sayur",
    kcal_per_100g: 44.0,
    protein_per_100g: 2.0,
    carbs_per_100g: 8.1,
    fat_per_100g: 0.7,
    default_unit_type: "mangkuk",
    grams_per_unit: 160.0,
  },
  {
    id: "daun-singkong",
    name: "Daun Singkong",
    aliases: ["gulai daun singkong", "daun singkong rebus", "urap daun singkong"],
    category: "sayur",
    kcal_per_100g: 37.0,
    protein_per_100g: 3.7,
    carbs_per_100g: 7.1,
    fat_per_100g: 0.6,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },
  {
    id: "terong",
    name: "Terong Ungu",
    aliases: ["terong balado", "terong kecap", "terong goreng"],
    category: "sayur",
    kcal_per_100g: 28.0,
    protein_per_100g: 1.1,
    carbs_per_100g: 5.5,
    fat_per_100g: 0.2,
    default_unit_type: "potong",
    grams_per_unit: 60.0,
  },
  {
    id: "buncis-wortel",
    name: "Buncis & Wortel",
    aliases: ["tumis buncis", "oseng buncis", "urap sayur", "pecel sayur"],
    category: "sayur",
    kcal_per_100g: 34.0,
    protein_per_100g: 1.9,
    carbs_per_100g: 7.0,
    fat_per_100g: 0.2,
    default_unit_type: "sdm",
    grams_per_unit: 35.0,
  },

  // SAMBAL & PELENGKAP (5)
  {
    id: "perkedel-kentang",
    name: "Perkedel Kentang (Adonan Dasar)",
    aliases: ["perkedel", "begedel"],
    category: "sambal_pelengkap",
    kcal_per_100g: 112.0,
    protein_per_100g: 3.2,
    carbs_per_100g: 21.0,
    fat_per_100g: 1.8,
    default_unit_type: "potong",
    grams_per_unit: 45.0,
  },
  {
    id: "bakwan-sayur",
    name: "Bakwan Sayur / Bala-Bala (Adonan Dasar)",
    aliases: ["bakwan", "bala-bala", "ote-ote", "bakwan jagung"],
    category: "sambal_pelengkap",
    kcal_per_100g: 138.0,
    protein_per_100g: 3.8,
    carbs_per_100g: 26.5,
    fat_per_100g: 1.6,
    default_unit_type: "potong",
    grams_per_unit: 50.0,
  },
  {
    id: "sambal-merah",
    name: "Sambal Cabai (Mentah/Dasar)",
    aliases: [
      "sambal terasi",
      "sambal bawang",
      "sambal korek",
      "sambal tomat",
      "sambal warteg",
    ],
    category: "sambal_pelengkap",
    kcal_per_100g: 48.0,
    protein_per_100g: 1.6,
    carbs_per_100g: 9.8,
    fat_per_100g: 0.6,
    default_unit_type: "sdm",
    grams_per_unit: 15.0,
  },
  {
    id: "sambal-ijo",
    name: "Sambal Cabai Hijau (Dasar)",
    aliases: ["sambal hijau", "cabe ijo", "sambal padang"],
    category: "sambal_pelengkap",
    kcal_per_100g: 44.0,
    protein_per_100g: 1.4,
    carbs_per_100g: 9.2,
    fat_per_100g: 0.5,
    default_unit_type: "sdm",
    grams_per_unit: 15.0,
  },
  {
    id: "kerupuk-putih",
    name: "Kerupuk Kaleng / Udang (Siap Makan)",
    aliases: ["kerupuk", "kerupuk putih", "kerupuk udang", "emping"],
    category: "sambal_pelengkap",
    kcal_per_100g: 476.0,
    protein_per_100g: 5.2,
    carbs_per_100g: 68.4,
    fat_per_100g: 20.5,
    default_unit_type: "potong",
    grams_per_unit: 15.0,
  },
];

/**
 * Simulasi ekstraksi struktur makanan warteg saat GEMINI_API_KEY belum diisi di .env.local.
 * Tetap 100% mematuhi aturan "No AI Math" dan divalidasi oleh VisionOutputSchema.
 */
export function getMockVisionOutput(): VisionOutput {
  const rawMock = {
    reference_object_type: "sendok" as const,
    detected_items: [
      {
        raw_name: "Nasi Putih",
        matched_category: "karbo" as const,
        cooking_method: "kukus_rebus" as const,
        estimated_grams: 150,
        portion_unit_type: "centong" as const,
        estimated_unit_qty: 1.5,
        confidence: 0.94,
        reference_object_found: true,
      },
      {
        raw_name: "Ayam Goreng Serundeng",
        matched_category: "protein_hewani" as const,
        cooking_method: "goreng" as const,
        estimated_grams: 90,
        portion_unit_type: "potong" as const,
        estimated_unit_qty: 1,
        confidence: 0.89,
        reference_object_found: true,
      },
      {
        raw_name: "Tempe Orek",
        matched_category: "protein_nabati" as const,
        cooking_method: "kecap_manis" as const,
        estimated_grams: 60,
        portion_unit_type: "sdm" as const,
        estimated_unit_qty: 2,
        confidence: 0.65,
        reference_object_found: true,
      },
      {
        raw_name: "Telur Balado",
        matched_category: "protein_hewani" as const,
        cooking_method: "balado" as const,
        estimated_grams: 55,
        portion_unit_type: "butir" as const,
        estimated_unit_qty: 1,
        confidence: 0.92,
        reference_object_found: true,
      },
      {
        raw_name: "Tumis Kangkung",
        matched_category: "sayur" as const,
        cooking_method: "tumis" as const,
        estimated_grams: 70,
        portion_unit_type: "sdm" as const,
        estimated_unit_qty: 2,
        confidence: 0.84,
        reference_object_found: true,
      },
    ],
  };

  return VisionOutputSchema.parse(rawMock);
}

// ============================================================================
// In-Memory Dev Fallback Store (aktif otomatis jika kredensial Supabase kosong)
// Disimpan di globalThis agar tahan terhadap hot-reload selama `next dev`.
// ============================================================================

interface LocalFallbackStore {
  target: UserTargetRow;
  meals: MealLogWithItems[];
}

const globalForTakar = globalThis as unknown as {
  __TAKAR_FALLBACK_STORE__?: LocalFallbackStore;
};

function getFallbackStore(): LocalFallbackStore {
  if (!globalForTakar.__TAKAR_FALLBACK_STORE__) {
    globalForTakar.__TAKAR_FALLBACK_STORE__ = {
      target: {
        id: "default-user",
        daily_kcal: 2200,
        daily_protein_g: 130,
        daily_carbs_g: 250,
        daily_fat_g: 65,
        updated_at: new Date().toISOString(),
      },
      meals: [],
    };
  }
  return globalForTakar.__TAKAR_FALLBACK_STORE__;
}

export function getFallbackUserTarget(): UserTargetRow {
  return getFallbackStore().target;
}

export function updateFallbackUserTarget(
  payload: UserTargetPayload
): UserTargetRow {
  const store = getFallbackStore();
  store.target = {
    id: "default-user",
    ...payload,
    updated_at: new Date().toISOString(),
  };
  return store.target;
}

export function listFallbackMealsForDate(dateIso?: string): MealLogWithItems[] {
  const store = getFallbackStore();
  if (!dateIso) {
    return [...store.meals].sort((a, b) =>
      b.logged_at.localeCompare(a.logged_at)
    );
  }
  const dayPrefix = dateIso.slice(0, 10);
  return store.meals
    .filter((m) => m.logged_at.slice(0, 10) === dayPrefix)
    .sort((a, b) => b.logged_at.localeCompare(a.logged_at));
}

export function createFallbackMeal(
  payload: CreateMealPayload
): MealLogWithItems {
  const store = getFallbackStore();
  const mealId = crypto.randomUUID();
  const nowIso = new Date().toISOString();

  const mealItems: MealItemRow[] = payload.items.map((item) => ({
    id: crypto.randomUUID(),
    meal_log_id: mealId,
    tkpi_food_id: item.tkpi_food_id,
    display_name: item.display_name,
    cooking_method: item.cooking_method,
    grams: item.grams,
    kcal: item.kcal,
    protein_g: item.protein_g,
    carbs_g: item.carbs_g,
    fat_g: item.fat_g,
    hidden_kcal: item.hidden_kcal,
  }));

  const created: MealLogWithItems = {
    id: mealId,
    logged_at: nowIso,
    meal_type: payload.meal_type,
    image_url: payload.image_url ?? null,
    total_kcal: payload.total_kcal,
    total_protein_g: payload.total_protein_g,
    total_carbs_g: payload.total_carbs_g,
    total_fat_g: payload.total_fat_g,
    reference_calibrated: payload.reference_calibrated,
    meal_items: mealItems,
  };

  store.meals.unshift(created);
  return created;
}

export function deleteFallbackMeal(id: string): boolean {
  const store = getFallbackStore();
  const before = store.meals.length;
  store.meals = store.meals.filter((m) => m.id !== id);
  return store.meals.length < before;
}

export function updateFallbackMeal(
  id: string,
  patch: UpdateMealPayload
): MealLogWithItems | null {
  const store = getFallbackStore();
  const idx = store.meals.findIndex((m) => m.id === id);
  if (idx === -1) return null;
  const existing = store.meals[idx];
  if (!existing) return null;

  const updated: MealLogWithItems = {
    ...existing,
    ...(patch.meal_type !== undefined ? { meal_type: patch.meal_type } : {}),
    ...(patch.total_kcal !== undefined ? { total_kcal: patch.total_kcal } : {}),
    ...(patch.total_protein_g !== undefined
      ? { total_protein_g: patch.total_protein_g }
      : {}),
    ...(patch.total_carbs_g !== undefined
      ? { total_carbs_g: patch.total_carbs_g }
      : {}),
    ...(patch.total_fat_g !== undefined
      ? { total_fat_g: patch.total_fat_g }
      : {}),
  };
  store.meals[idx] = updated;
  return updated;
}
