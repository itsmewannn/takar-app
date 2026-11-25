"use client";

import { useCallback, useMemo, useState } from "react";
import {
  buildCalculatedItem,
  recalculateItemByCookingMethod,
  recalculateItemByUnitQty,
  sumMealMacros,
} from "@/lib/nutrition-engine";
import type {
  CalculatedItem,
  CookingMethod,
  MealType,
  ReferenceObjectType,
  TkpiFood,
} from "@/types/nutrition.types";

export const REVIEW_SESSION_STORAGE_KEY = "takar_active_review_v1";

export interface StoredReviewSession {
  items: CalculatedItem[];
  imageUrl: string | null;
  referenceCalibrated: boolean;
  referenceObjectType: ReferenceObjectType;
  source: "gemini_vision" | "mock_fallback" | "manual";
}

function defaultMealTypeByHour(): MealType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "sarapan";
  if (hour >= 10 && hour < 15) return "makan_siang";
  if (hour >= 17 && hour < 22) return "makan_malam";
  return "camilan";
}

export function useMealCalculator(initial?: Partial<StoredReviewSession>) {
  const [items, setItems] = useState<CalculatedItem[]>(initial?.items ?? []);
  const [mealType, setMealType] = useState<MealType>(defaultMealTypeByHour);
  const [imageUrl, setImageUrl] = useState<string | null>(
    initial?.imageUrl ?? null
  );
  const [referenceCalibrated, setReferenceCalibrated] = useState<boolean>(
    initial?.referenceCalibrated ?? false
  );
  const [referenceObjectType, setReferenceObjectType] =
    useState<ReferenceObjectType>(initial?.referenceObjectType ?? "tidak_ada");
  const [source, setSource] = useState<
    "gemini_vision" | "mock_fallback" | "manual"
  >(initial?.source ?? "manual");

  const hydrateSession = useCallback((session: StoredReviewSession) => {
    setItems(session.items);
    setImageUrl(session.imageUrl);
    setReferenceCalibrated(session.referenceCalibrated);
    setReferenceObjectType(session.referenceObjectType);
    setSource(session.source);
  }, []);

  /**
   * 1-Tap Portion Correction (< 16ms, murni sinkron di memori klien).
   */
  const updatePortionQty = useCallback(
    (clientId: string, nextUnitQty: number) => {
      setItems((prev) =>
        prev.map((item) =>
          item.client_id === clientId
            ? recalculateItemByUnitQty(item, nextUnitQty)
            : item
        )
      );
    },
    []
  );

  /**
   * 1-Tap Cooking Method Change (< 16ms, murni sinkron di memori klien).
   */
  const updateCookingMethod = useCallback(
    (clientId: string, nextMethod: CookingMethod) => {
      setItems((prev) =>
        prev.map((item) =>
          item.client_id === clientId
            ? recalculateItemByCookingMethod(item, nextMethod)
            : item
        )
      );
    },
    []
  );

  const removeItem = useCallback((clientId: string) => {
    setItems((prev) => prev.filter((item) => item.client_id !== clientId));
  }, []);

  const addManualFood = useCallback(
    (
      food: TkpiFood,
      cookingMethod: CookingMethod = "kukus_rebus",
      unitQty = 1
    ) => {
      const created = buildCalculatedItem({
        clientId: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        food,
        rawName: food.name,
        displayName: food.name,
        cookingMethod,
        portionUnitType: food.default_unit_type,
        unitQty,
        confidence: 1,
        referenceObjectFound: referenceCalibrated,
      });
      setItems((prev) => [...prev, created]);
    },
    [referenceCalibrated]
  );

  const summary = useMemo(() => sumMealMacros(items), [items]);

  return {
    items,
    summary,
    mealType,
    setMealType,
    imageUrl,
    referenceCalibrated,
    referenceObjectType,
    source,
    hydrateSession,
    updatePortionQty,
    updateCookingMethod,
    removeItem,
    addManualFood,
  };
}
