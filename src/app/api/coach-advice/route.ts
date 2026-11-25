import { NextResponse } from "next/server";
import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { z } from "zod";
import { roundToOneDecimal } from "@/lib/nutrition-engine";

const CoachRequestSchema = z.object({
  goal: z.enum(["Cutting", "Bulking", "Rekomposisi"]),
  consumedKcal: z.number().nonnegative(),
  targetKcal: z.number().positive(),
  consumedProteinG: z.number().nonnegative(),
  targetProteinG: z.number().positive(),
  hiddenKcal: z.number().nonnegative().optional().default(0),
  mealCount: z.number().int().nonnegative().optional().default(0),
  timeOfDay: z.string().optional().default("Hari ini"),
});

export interface CoachMenuOption {
  id: string;
  title: string;
  portion_note: string;
  protein_g: number;
  kcal: number;
}

export interface CoachAdviceResponse {
  coach_message: string;
  menus: Array<{
    title: string;
    portion_note: string;
    reason: string;
    protein_g: number;
    kcal: number;
  }>;
  source: "gemini_coach" | "deterministic_fallback";
}

/**
 * Paket menu lokal yang angkanya 100% dihitung deterministik dari tabel TKPI + cooking_modifiers
 * (mematuhi aturan mutlak NO AI MATH — AI hanya menyusun narasi & memilih paket yang cocok).
 */
const DETERMINISTIC_MENU_CATALOG: Record<
  "Cutting" | "Bulking" | "Rekomposisi",
  CoachMenuOption[]
> = {
  Cutting: [
    {
      id: "cut-1",
      title: "Dada Ayam Bakar + Sayur Bayam Bening",
      portion_note: "1 potong dada (100g) + 1 mangkuk bayam (150g)",
      protein_g: 35.4,
      kcal: 200,
    },
    {
      id: "cut-2",
      title: "Ikan Tongkol Pindang + Tahu Kukus",
      portion_note: "1 potong tongkol (75g) + 2 potong tahu (110g)",
      protein_g: 30.0,
      kcal: 189,
    },
    {
      id: "cut-3",
      title: "2 Putih/Utuh Telur Rebus + Tumis Kangkung Tipis",
      portion_note: "2 butir telur (110g) + 2 sdm kangkung (70g)",
      protein_g: 16.0,
      kcal: 216,
    },
  ],
  Rekomposisi: [
    {
      id: "rec-1",
      title: "Nasi Putih 1 Centong + Dada Ayam Bakar + Tempe Panggang",
      portion_note: "100g nasi + 100g dada ayam + 1 potong tempe (50g)",
      protein_g: 42.9,
      kcal: 392,
    },
    {
      id: "rec-2",
      title: "Nasi Merah + Ikan Kembung Bakar + Sayur Asem",
      portion_note: "1 centong nasi merah + 1 ekor kembung + 1 mangkuk sayur asem",
      protein_g: 23.9,
      kcal: 349,
    },
    {
      id: "rec-3",
      title: "2 Telur Rebus + 2 Potong Tempe Kukus",
      portion_note: "110g telur rebus + 100g tempe kedelai tanpa minyak",
      protein_g: 32.9,
      kcal: 364,
    },
  ],
  Bulking: [
    {
      id: "bulk-1",
      title: "Nasi Putih 1.5 Centong + Dada Ayam Bakar + 2 Potong Tempe",
      portion_note: "150g nasi + 100g dada ayam + 100g tempe panggang",
      protein_g: 53.6,
      kcal: 553,
    },
    {
      id: "bulk-2",
      title: "Nasi Putih 2 Centong + Daging Sapi Semur + Telur Rebus",
      portion_note: "200g nasi + 1 potong sapi (70g) + 1 butir telur (55g)",
      protein_g: 29.9,
      kcal: 532,
    },
    {
      id: "bulk-3",
      title: "Lontong + Paha Ayam Bakar + Tahu & Tempe Bacem",
      portion_note: "150g lontong + 1 paha ayam + 1 tahu + 1 tempe",
      protein_g: 42.2,
      kcal: 595,
    },
  ],
};

function buildFallbackAdvice(
  req: z.infer<typeof CoachRequestSchema>
): CoachAdviceResponse {
  const remainingProtein = roundToOneDecimal(
    Math.max(0, req.targetProteinG - req.consumedProteinG)
  );
  const remainingKcal = Math.round(req.targetKcal - req.consumedKcal);
  const options = DETERMINISTIC_MENU_CATALOG[req.goal];

  let coachMessage: string;
  if (req.goal === "Cutting" && remainingKcal < 0) {
    coachMessage = `Kalori hari ini sudah lewat ${Math.abs(remainingKcal)} kkal dari batas Cutting. Fokus hidrasi air putih dulu ya, dan kalau masih lapar pilih menu rebus/bening rendah kalori di bawah untuk besok.`;
  } else if (remainingProtein > 0) {
    coachMessage = `Kamu masih butuh ${remainingProtein}g protein lagi (sisa ruang ${Math.max(0, remainingKcal)} kkal) untuk target ${req.goal}. Pilih salah satu kombinasi lauk lokal rendah minyak ini:`;
  } else {
    coachMessage = `Mantap! Target protein ${req.goal} sudah terpenuhi hari ini. Kalau masih ada jam makan, jaga tetap bersih dengan pilihan ringan berikut:`;
  }

  return {
    coach_message: coachMessage,
    menus: options.map((opt) => ({
      title: opt.title,
      portion_note: opt.portion_note,
      reason:
        req.goal === "Cutting"
          ? "Tinggi protein tanpa tambahan kalori minyak goreng."
          : req.goal === "Bulking"
            ? "Padat protein & karbohidrat bersih buat dukung surplus otot."
            : "Rasio protein-ke-kalori ideal untuk rekomposisi tubuh.",
      protein_g: opt.protein_g,
      kcal: opt.kcal,
    })),
    source: "deterministic_fallback",
  };
}

const GEMINI_COACH_SCHEMA: Schema = {
  type: Type.OBJECT,
  required: ["coach_message", "selected_reasons"],
  properties: {
    coach_message: {
      type: Type.STRING,
      description:
        "Sapaan singkat maskot TAKA (2-3 kalimat ramah Bahasa Indonesia) tanpa mengarang angka gizi.",
    },
    selected_reasons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["id", "reason"],
        properties: {
          id: { type: Type.STRING },
          reason: {
            type: Type.STRING,
            description: "Alasan singkat 1 kalimat kenapa menu lokal ini cocok.",
          },
        },
      },
    },
  },
};

const GeminiCoachOutputSchema = z.object({
  coach_message: z.string().min(5).max(420),
  selected_reasons: z
    .array(
      z.object({
        id: z.string(),
        reason: z.string().min(3).max(200),
      })
    )
    .min(1),
});

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = CoachRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parameter nutrisi tidak valid." },
        { status: 400 }
      );
    }

    const reqData = parsed.data;
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(buildFallbackAdvice(reqData));
    }

    const remainingProtein = roundToOneDecimal(
      Math.max(0, reqData.targetProteinG - reqData.consumedProteinG)
    );
    const remainingKcal = Math.round(reqData.targetKcal - reqData.consumedKcal);
    const menuCandidates = DETERMINISTIC_MENU_CATALOG[reqData.goal];

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Waktu: ${reqData.timeOfDay}
Program: ${reqData.goal}
Protein saat ini: ${roundToOneDecimal(reqData.consumedProteinG)}g dari target ${reqData.targetProteinG}g (kurang ${remainingProtein}g)
Kalori saat ini: ${Math.round(reqData.consumedKcal)} kkal dari batas ${reqData.targetKcal} kkal (selisih ${remainingKcal} kkal)
Kalori minyak tersembunyi hari ini: ${Math.round(reqData.hiddenKcal)} kkal

Kandidat menu TKPI terkalibrasi (JANGAN ubah angka protein/kalori ini):
${menuCandidates
  .map(
    (m) =>
      `- id="${m.id}": ${m.title} (${m.portion_note}) -> ${m.protein_g}g P, ${m.kcal} kkal`
  )
  .join("\n")}

Tuliskan coach_message ramah ala maskot TAKA yang suportif & ringkas, serta alasan singkat untuk masing-masing id menu di atas.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction:
          "Kamu adalah TAKA, maskot AI nutrisi makanan lokal Indonesia di aplikasi TAKAR. ATURAN MUTLAK: DILARANG menghitung sendiri atau mengubah angka kalori/protein. Gunakan hanya fakta yang diberikan user dan berikan motivasi singkat, hangat, serta membumi ala anak gym/sehat Indonesia tanpa emoji berlebihan.",
        responseMimeType: "application/json",
        responseSchema: GEMINI_COACH_SCHEMA,
        temperature: 0.4,
      },
    });

    const rawText = response.text;
    if (!rawText) {
      return NextResponse.json(buildFallbackAdvice(reqData));
    }

    const validatedAi = GeminiCoachOutputSchema.safeParse(JSON.parse(rawText));
    if (!validatedAi.success) {
      return NextResponse.json(buildFallbackAdvice(reqData));
    }

    const reasonById = new Map(
      validatedAi.data.selected_reasons.map((r) => [r.id, r.reason])
    );

    const payload: CoachAdviceResponse = {
      coach_message: validatedAi.data.coach_message,
      menus: menuCandidates.map((opt) => ({
        title: opt.title,
        portion_note: opt.portion_note,
        reason:
          reasonById.get(opt.id) ??
          "Pilihan praktis tinggi protein berbasis tabel TKPI.",
        protein_g: opt.protein_g,
        kcal: opt.kcal,
      })),
      source: "gemini_coach",
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      buildFallbackAdvice({
        goal: "Rekomposisi",
        consumedKcal: 0,
        targetKcal: 2200,
        consumedProteinG: 0,
        targetProteinG: 130,
        hiddenKcal: 0,
        mealCount: 0,
        timeOfDay: "Hari ini",
      })
    );
  }
}
