export interface CompressedImageResult {
  base64Data: string;
  mimeType: "image/webp" | "image/jpeg";
  previewDataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
}

/**
 * Kompresi gambar otomatis di sisi klien (max 1024px, WebP dengan fallback JPEG)
 * sebelum dikirim ke `/api/analyze-meal` untuk menghemat latency & kuota API (PRD F1).
 */
export async function compressMealImage(
  source: File | Blob | string,
  maxDimension = 1024,
  quality = 0.82
): Promise<CompressedImageResult> {
  const imageUrl =
    typeof source === "string" ? source : URL.createObjectURL(source);

  try {
    const img = await loadHtmlImage(imageUrl);
    const { targetWidth, targetHeight } = computeTargetDimensions(
      img.naturalWidth || img.width,
      img.naturalHeight || img.height,
      maxDimension
    );

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas 2D context tidak tersedia di browser ini.");
    }

    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    let dataUrl = canvas.toDataURL("image/webp", quality);
    let mimeType: "image/webp" | "image/jpeg" = "image/webp";

    if (!dataUrl.startsWith("data:image/webp")) {
      dataUrl = canvas.toDataURL("image/jpeg", quality);
      mimeType = "image/jpeg";
    }

    const commaIdx = dataUrl.indexOf(",");
    const base64Data = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
    const sizeBytes = Math.ceil((base64Data.length * 3) / 4);

    return {
      base64Data,
      mimeType,
      previewDataUrl: dataUrl,
      width: targetWidth,
      height: targetHeight,
      sizeBytes,
    };
  } finally {
    if (typeof source !== "string") {
      URL.revokeObjectURL(imageUrl);
    }
  }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Gagal memuat gambar untuk kompresi."));
    img.src = src;
  });
}

function computeTargetDimensions(
  width: number,
  height: number,
  maxDimension: number
): { targetWidth: number; targetHeight: number } {
  if (width <= maxDimension && height <= maxDimension) {
    return {
      targetWidth: Math.max(1, Math.round(width)),
      targetHeight: Math.max(1, Math.round(height)),
    };
  }

  if (width >= height) {
    const ratio = maxDimension / width;
    return {
      targetWidth: maxDimension,
      targetHeight: Math.max(1, Math.round(height * ratio)),
    };
  }

  const ratio = maxDimension / height;
  return {
    targetWidth: Math.max(1, Math.round(width * ratio)),
    targetHeight: maxDimension,
  };
}
