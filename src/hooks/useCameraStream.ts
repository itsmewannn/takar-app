"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CameraStatus =
  | "initializing"
  | "streaming"
  | "denied"
  | "unsupported"
  | "error";

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CameraStatus>("initializing");
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    setTorchOn(false);
  }, []);

  const startStream = useCallback(
    async (mode: "environment" | "user" = facingMode) => {
      stopStream();
      setErrorMessage(null);

      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        setStatus("unsupported");
        setErrorMessage(
          "Kamera langsung tidak didukung di perangkat/browser ini. Gunakan unggah foto di bawah."
        );
        return;
      }

      setStatus("initializing");

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1600 },
            height: { ideal: 1200 },
          },
          audio: false,
        });

        streamRef.current = mediaStream;

        const videoTrack = mediaStream.getVideoTracks()[0];
        if (videoTrack && "getCapabilities" in videoTrack) {
          const capabilities = videoTrack.getCapabilities() as Record<
            string,
            unknown
          >;
          setTorchSupported(Boolean(capabilities?.torch));
        } else {
          setTorchSupported(false);
        }

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          await videoRef.current.play().catch(() => undefined);
        }

        setStatus("streaming");
      } catch (err) {
        const domErr = err as DOMException | undefined;
        if (
          domErr?.name === "NotAllowedError" ||
          domErr?.name === "PermissionDeniedError"
        ) {
          setStatus("denied");
          setErrorMessage(
            "Izin kamera ditolak. Aktifkan akses kamera atau pilih foto dari galeri."
          );
        } else {
          setStatus("error");
          setErrorMessage(
            "Kamera tidak ditemukan pada perangkat ini. Pilih atau ambil foto lewat tombol galeri."
          );
        }
      }
    },
    [facingMode, stopStream]
  );

  useEffect(() => {
    void startStream(facingMode);
    return () => {
      stopStream();
    };
  }, [facingMode, startStream, stopStream]);

  const toggleFacingMode = useCallback(() => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  }, []);

  const toggleTorch = useCallback(async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track || !torchSupported) return;
    const next = !torchOn;
    try {
      await track.applyConstraints({
        advanced: [{ torch: next } as MediaTrackConstraintSet],
      });
      setTorchOn(next);
    } catch {
      setTorchSupported(false);
    }
  }, [torchOn, torchSupported]);

  const captureFrame = useCallback(async (): Promise<Blob | null> => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      return null;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        "image/jpeg",
        0.9
      );
    });
  }, []);

  return {
    videoRef,
    status,
    errorMessage,
    facingMode,
    torchSupported,
    torchOn,
    startStream,
    stopStream,
    toggleFacingMode,
    toggleTorch,
    captureFrame,
  };
}
