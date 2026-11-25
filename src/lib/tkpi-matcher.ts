import { DEFAULT_TKPI_FOODS } from "./mock-fallback";
import type { FoodCategory, TkpiFood } from "@/types/nutrition.types";

const COOKING_NOISE_WORDS = new Set([
  "goreng",
  "bakar",
  "panggang",
  "rebus",
  "kukus",
  "tumis",
  "oseng",
  "cah",
  "kuah",
  "santan",
  "balado",
  "kecap",
  "manis",
  "pedas",
  "bumbu",
  "warteg",
  "rumahan",
  "porsi",
]);

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripCookingWords(normalized: string): string {
  const tokens = normalized
    .split(" ")
    .filter((token) => token.length > 0 && !COOKING_NOISE_WORDS.has(token));
  return tokens.join(" ");
}

function buildTrigrams(text: string): Set<string> {
  const padded = `  ${text} `;
  const trigrams = new Set<string>();
  for (let i = 0; i <= padded.length - 3; i++) {
    trigrams.add(padded.slice(i, i + 3));
  }
  return trigrams;
}

/**
 * Kemiripan trigram ala PostgreSQL `pg_trgm` (0.0 - 1.0).
 */
export function trigramSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const setA = buildTrigrams(a);
  const setB = buildTrigrams(b);
  let intersection = 0;
  for (const gram of setA) {
    if (setB.has(gram)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const CATEGORY_FALLBACK_ID: Record<FoodCategory, string> = {
  karbo: "nasi-putih",
  protein_hewani: "paha-ayam",
  protein_nabati: "tempe-kedelai",
  sayur: "capcay-sayur",
  sambal_pelengkap: "sambal-merah",
};

/**
 * Mencocokkan `raw_name` hasil Vision AI ke entri `tkpi_foods` paling akurat:
 * 1. Exact match pada nama atau alias
 * 2. Substring / token match pada alias & nama dasar
 * 3. Fuzzy trigram similarity (`pg_trgm` semantics)
 * 4. Fallback deterministik berdasarkan `matched_category`
 */
export function matchTkpiFood(
  rawName: string,
  matchedCategory: FoodCategory,
  catalog: TkpiFood[] = DEFAULT_TKPI_FOODS
): { food: TkpiFood; matchScore: number } {
  const foods = catalog.length > 0 ? catalog : DEFAULT_TKPI_FOODS;
  const normQuery = normalizeText(rawName);
  const coreQuery = stripCookingWords(normQuery) || normQuery;

  let bestFood: TkpiFood | undefined;
  let bestScore = -1;

  for (const candidate of foods) {
    const candidatesText = [candidate.name, ...candidate.aliases].map(
      normalizeText
    );

    let candidateScore = 0;

    for (const target of candidatesText) {
      const coreTarget = stripCookingWords(target) || target;

      if (normQuery === target || coreQuery === coreTarget) {
        candidateScore = Math.max(candidateScore, 1.0);
        break;
      }

      if (target.includes(normQuery) || normQuery.includes(target)) {
        candidateScore = Math.max(candidateScore, 0.88);
      } else if (
        coreTarget.length >= 3 &&
        coreQuery.length >= 3 &&
        (coreTarget.includes(coreQuery) || coreQuery.includes(coreTarget))
      ) {
        candidateScore = Math.max(candidateScore, 0.8);
      }

      const simFull = trigramSimilarity(normQuery, target);
      const simCore = trigramSimilarity(coreQuery, coreTarget);
      candidateScore = Math.max(candidateScore, simFull, simCore * 0.95);
    }

    if (candidate.category === matchedCategory) {
      candidateScore += 0.08;
    }

    if (candidateScore > bestScore) {
      bestScore = candidateScore;
      bestFood = candidate;
    }
  }

  if (bestFood && bestScore >= 0.32) {
    return { food: bestFood, matchScore: Math.min(1, bestScore) };
  }

  const fallbackId = CATEGORY_FALLBACK_ID[matchedCategory];
  const fallbackFood =
    foods.find((f) => f.id === fallbackId) ??
    foods.find((f) => f.category === matchedCategory) ??
    foods[0]!;

  return { food: fallbackFood, matchScore: 0.25 };
}

/**
 * Pencarian manual TKPI untuk fitur "+ Tambah Lauk Manual" & Explorer `/settings`.
 */
export function searchTkpiFoods(
  query: string,
  category?: FoodCategory | "semua",
  catalog: TkpiFood[] = DEFAULT_TKPI_FOODS
): TkpiFood[] {
  const filtered =
    category && category !== "semua"
      ? catalog.filter((f) => f.category === category)
      : catalog;

  const norm = normalizeText(query);
  if (!norm) {
    return filtered;
  }

  return filtered
    .map((food) => {
      const targets = [food.name, ...food.aliases].map(normalizeText);
      let score = 0;
      for (const t of targets) {
        if (t.startsWith(norm)) score = Math.max(score, 1.0);
        else if (t.includes(norm)) score = Math.max(score, 0.85);
        else score = Math.max(score, trigramSimilarity(norm, t));
      }
      return { food, score };
    })
    .filter((entry) => entry.score >= 0.2)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.food);
}
