"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, PenLine } from "lucide-react";
import { AnalyzingStepper } from "@/components/scan/AnalyzingStepper";
import { CameraViewfinder } from "@/components/scan/CameraViewfinder";
import { Button } from "@/components/ui/Button";
import {
  REVIEW_SESSION_STORAGE_KEY,
  type StoredReviewSession,
} from "@/hooks/useMealCalculator";
import { compressMealImage } from "@/lib/image-compressor";
import type { AnalyzeMealResponse } from "@/types/nutrition.types";

type ScanViewState = "capture" | "analyzing" | "error";

export default function ScanPage() {
  const router = useRouter();
  const [viewState, setViewState] = React.useState<ScanViewState>("capture");
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSelectImage = async (fileOrBlob: File | Blob) => {
    setErrorMessage(null);
    setViewState("analyzing");

    try {
      const compressed = await compressMealImage(fileOrBlob, 1024, 0.82);
      const thumb = await compressMealImage(
        compressed.previewDataUrl,
        360,
        0.72
      );
      setPreviewUrl(compressed.previewDataUrl);

      const response = await fetch("/api/analyze-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: compressed.base64Data,
          mimeType: compressed.mimeType,
        }),
      });

      if (!response.ok) {
        const errBody = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          errBody?.error ??
            "Foto kurang jelas atau layanan analisis sedang sibuk."
        );
      }

      const result = (await response.json()) as AnalyzeMealResponse;

      const sessionData: StoredReviewSession = {
        items: result.items,
        imageUrl: thumb.previewDataUrl,
        referenceCalibrated: result.reference_calibrated,
        referenceObjectType: result.reference_object_type,
        source: result.source,
      };

      sessionStorage.setItem(
        REVIEW_SESSION_STORAGE_KEY,
        JSON.stringify(sessionData)
      );

      router.push("/scan/review");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Gagal memproses foto makanan. Silakan foto ulang atau catat manual."
      );
      setViewState("error");
    }
  };

  if (viewState === "analyzing") {
    return <AnalyzingStepper previewUrl={previewUrl} />;
  }

  if (viewState === "error") {
    return (
      <div className="flex min-h-dvh flex-col justify-center bg-canvas p-5">
        <div className="rounded-3xl bg-surface p-6 shadow-soft">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning-bg text-warning">
            <AlertCircle className="h-6 w-6" strokeWidth={1.8} />
          </div>
          <h1 className="text-[19px] font-bold leading-snug text-ink">
            Foto Belum Dapat Dianalisis
          </h1>
          <p className="mt-1.5 text-[14px] leading-relaxed text-ink-secondary">
            {errorMessage ??
              "Pastikan pencahayaan cukup dan piring terlihat jelas, atau catat lauk langsung dari database TKPI."}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button
              variant="primary"
              onClick={() => {
                setErrorMessage(null);
                setViewState("capture");
              }}
            >
              <Camera className="h-4 w-4" strokeWidth={1.8} />
              <span>Foto Ulang</span>
            </Button>

            <Button
              variant="charcoal"
              onClick={() => router.push("/scan/review?mode=manual")}
            >
              <PenLine className="h-4 w-4" strokeWidth={1.8} />
              <span>Catat Manual</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CameraViewfinder
      onSelectImage={(fileOrBlob) => void handleSelectImage(fileOrBlob)}
      onCancel={() => router.push("/")}
    />
  );
}
