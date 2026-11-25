"use client";

import * as React from "react";
import {
  Camera,
  ImagePlus,
  RefreshCw,
  SwitchCamera,
  Upload,
  X,
  Zap,
} from "lucide-react";
import { useCameraStream } from "@/hooks/useCameraStream";
import { ScaleOverlaySvg } from "./ScaleOverlaySvg";

export interface CameraViewfinderProps {
  onSelectImage: (fileOrBlob: File | Blob) => void;
  onCancel: () => void;
}

export function CameraViewfinder({
  onSelectImage,
  onCancel,
}: CameraViewfinderProps) {
  const {
    videoRef,
    status,
    errorMessage,
    torchSupported,
    torchOn,
    startStream,
    toggleFacingMode,
    toggleTorch,
    captureFrame,
  } = useCameraStream();

  const galleryInputRef = React.useRef<HTMLInputElement | null>(null);
  const environmentCaptureInputRef = React.useRef<HTMLInputElement | null>(
    null
  );
  const [capturing, setCapturing] = React.useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectImage(file);
    }
    e.target.value = "";
  };

  const handleShutterClick = async () => {
    if (status !== "streaming") {
      environmentCaptureInputRef.current?.click();
      return;
    }

    setCapturing(true);
    try {
      const blob = await captureFrame();
      if (blob) {
        onSelectImage(blob);
      } else {
        environmentCaptureInputRef.current?.click();
      }
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col justify-between bg-viewfinder text-white">
      <input
        ref={environmentCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Ambil foto dengan kamera perangkat"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        aria-label="Pilih foto makanan dari galeri"
      />

      {/* Top Header */}
      <header className="relative z-20 flex items-center justify-between px-5 pb-3 pt-5">
        <div>
          <span className="inline-flex rounded-full bg-emeraldBrand/25 px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-[#6EE7B7]">
            Kalibrasi Skala
          </span>
          <h1 className="mt-1 text-[18px] font-bold tracking-[-0.01em] text-white">
            Scan Piring Makan
          </h1>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Tutup kamera"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </header>

      {/* Viewfinder Canvas */}
      <div className="relative mx-4 my-1 flex flex-1 items-center justify-center overflow-hidden rounded-3xl bg-[#161B22]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={[
            "h-full w-full object-cover",
            status === "streaming" ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <ScaleOverlaySvg />

        {status !== "streaming" ? (
          <div className="relative z-10 mx-5 max-w-[330px] rounded-3xl bg-charcoal p-6 text-center shadow-2xl">
            <div className="mx-auto mb-3.5 flex h-12 w-12 items-center justify-center rounded-full bg-emeraldBrand/20 text-[#6EE7B7]">
              <Camera className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <p className="text-[15px] font-bold text-white">
              {status === "initializing"
                ? "Menyiapkan Kamera..."
                : "Unggah Foto Makanan"}
            </p>
            {errorMessage ? (
              <p className="mt-1.5 text-[12px] leading-relaxed text-white/65">
                {errorMessage}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => environmentCaptureInputRef.current?.click()}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-emeraldBrand px-4 text-[13px] font-semibold text-white transition-colors hover:bg-emeraldBrand-hover"
              >
                <Upload className="h-4 w-4" strokeWidth={1.8} />
                <span>Pilih / Ambil Foto Piring</span>
              </button>

              {status !== "initializing" && status !== "unsupported" ? (
                <button
                  type="button"
                  onClick={() => void startStream()}
                  className="inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-2xl bg-white/10 px-3 text-[12px] font-semibold text-white/85 hover:bg-white/15"
                >
                  <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.8} />
                  <span>Coba Kamera Lagi</span>
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* Bottom Camera Controls */}
      <footer className="relative z-20 px-7 pb-7 pt-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            className="flex h-12 items-center gap-2 rounded-2xl bg-white/10 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.8} />
            <span>Galeri</span>
          </button>

          <button
            type="button"
            disabled={capturing}
            onClick={() => void handleShutterClick()}
            aria-label="Jepret foto makanan"
            className="flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] border-white/90 p-1.5 transition-transform active:scale-95 disabled:opacity-50"
          >
            <span className="h-full w-full rounded-full bg-white" />
          </button>

          {torchSupported ? (
            <button
              type="button"
              onClick={() => void toggleTorch()}
              aria-label="Nyalakan lampu kilat"
              className={[
                "flex h-12 items-center gap-1.5 rounded-2xl px-4 text-[13px] font-semibold transition-colors",
                torchOn
                  ? "bg-warning-bg text-warning"
                  : "bg-white/10 text-white hover:bg-white/15",
              ].join(" ")}
            >
              <Zap className="h-4 w-4" strokeWidth={1.8} />
              <span>Flash</span>
            </button>
          ) : status === "streaming" ? (
            <button
              type="button"
              onClick={toggleFacingMode}
              aria-label="Ganti arah kamera"
              className="flex h-12 items-center gap-1.5 rounded-2xl bg-white/10 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              <SwitchCamera className="h-4 w-4" strokeWidth={1.8} />
              <span>Putar</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-12 items-center gap-1.5 rounded-2xl bg-white/10 px-4 text-[13px] font-semibold text-white transition-colors hover:bg-white/15"
            >
              <X className="h-4 w-4" strokeWidth={1.8} />
              <span>Batal</span>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
