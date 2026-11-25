import { GoogleGenAI, Type, type Schema } from "@google/genai";
import {
  VisionOutputSchema,
  type VisionOutput,
} from "@/schemas/vision-output.schema";
import { getMockVisionOutput } from "./mock-fallback";

const VISION_SYSTEM_PROMPT = `Kamu adalah modul ekstraksi visual makanan Indonesia (warteg & masakan rumahan) untuk aplikasi TAKAR.

ATURAN MUTLAK (NON-NEGOTIABLE):
1. DILARANG menghitung atau menyertakan angka kalori, protein, karbohidrat, atau lemak dalam bentuk apa pun.
2. Tugasmu HANYA mengenali daftar makanan di piring, metode memasaknya, satuan porsi lokal Indonesia, dan estimasi gramasi fisik.
3. Cari objek referensi skala fisik pada foto:
   - Sendok makan standar Indonesia panjang ~19 cm ("sendok")
   - Tepi/diameter piring makan standar ~24 cm ("piring")
   - Jika keduanya terlihat jelas isi "keduanya", jika tidak terlihat isi "tidak_ada".
4. Gunakan panduan porsi lokal standar berikut untuk kalibrasi:
   - 1 centong nasi = ~100g
   - 1 potong sedang ayam/ikan = ~75-100g
   - 1 potong tahu/tempe = ~50-55g
   - 1 sdm lauk cincang/orek/sayur tumis = ~30-35g
   - 1 butir telur ayam = ~55g
   - 1 mangkuk sayur berkuah = ~160-180g
5. Gunakan nama makanan Bahasa Indonesia yang lazim di warteg (contoh: "Nasi Putih", "Tempe Orek", "Telur Balado", "Ayam Goreng", "Tumis Kangkung", "Ikan Tongkol Balado").`;

const GEMINI_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  required: ["reference_object_type", "detected_items"],
  properties: {
    reference_object_type: {
      type: Type.STRING,
      enum: ["sendok", "piring", "keduanya", "tidak_ada"],
      description: "Objek referensi ukuran fisik yang terdeteksi di sekitar makanan.",
    },
    detected_items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          "raw_name",
          "matched_category",
          "cooking_method",
          "estimated_grams",
          "portion_unit_type",
          "estimated_unit_qty",
          "confidence",
          "reference_object_found",
        ],
        properties: {
          raw_name: {
            type: Type.STRING,
            description: "Nama lauk/makanan dalam Bahasa Indonesia.",
          },
          matched_category: {
            type: Type.STRING,
            enum: [
              "karbo",
              "protein_hewani",
              "protein_nabati",
              "sayur",
              "sambal_pelengkap",
            ],
          },
          cooking_method: {
            type: Type.STRING,
            enum: [
              "kukus_rebus",
              "panggang",
              "tumis",
              "goreng",
              "goreng_tepung",
              "balado",
              "santan",
              "kecap_manis",
            ],
          },
          estimated_grams: {
            type: Type.NUMBER,
            description: "Estimasi berat bagian yang dapat dimakan dalam gram.",
          },
          portion_unit_type: {
            type: Type.STRING,
            enum: ["centong", "potong", "sdm", "butir", "mangkuk"],
          },
          estimated_unit_qty: {
            type: Type.NUMBER,
            description: "Jumlah dalam satuan lokal (misal 1.5 centong, 2 sdm).",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Tingkat keyakinan deteksi antara 0.0 hingga 1.0.",
          },
          reference_object_found: {
            type: Type.BOOLEAN,
            description: "True bila sendok atau tepi piring terlihat sebagai acuan skala.",
          },
        },
      },
    },
  },
};

export async function analyzeMealImageWithVision(params: {
  base64Data: string;
  mimeType: string;
}): Promise<{
  vision: VisionOutput;
  source: "gemini_vision" | "mock_fallback";
}> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    // Dev-ready fallback otomatis jika GEMINI_API_KEY belum diisi di .env.local
    await new Promise((resolve) => setTimeout(resolve, 650));
    return {
      vision: getMockVisionOutput(),
      source: "mock_fallback",
    };
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              data: params.base64Data,
              mimeType: params.mimeType,
            },
          },
          {
            text: "Identifikasi seluruh makanan di piring ini beserta cara masak, satuan lokal, estimasi gramasi, dan referensi skala fisik sesuai skema JSON. Jangan pernah menghitung kalori atau nutrisi.",
          },
        ],
      },
    ],
    config: {
      systemInstruction: VISION_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      temperature: 0.1,
    },
  });

  const rawText = response.text;
  if (!rawText) {
    throw new Error("Gemini Vision mengembalikan respons kosong.");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(rawText);
  } catch {
    throw new Error("Respons Gemini Vision bukan JSON yang valid.");
  }

  const validated = VisionOutputSchema.parse(parsedJson);
  return {
    vision: validated,
    source: "gemini_vision",
  };
}
