"use client";

import Link from "next/link";
import { Camera, ScanLine } from "lucide-react";

export function BottomActionDock() {
  return (
    <nav aria-label="Aksi utama" className="grid grid-cols-2 gap-3">
      <Link
        href="/scan"
        className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-charcoal px-4 text-[14px] font-semibold text-white shadow-soft transition-all hover:bg-charcoal-hover active:scale-[0.99]"
      >
        <Camera className="h-[18px] w-[18px] text-white" strokeWidth={1.8} />
        <span>Scan Makanan</span>
      </Link>

      <Link
        href="/profile"
        className="inline-flex h-[52px] items-center justify-center gap-2.5 rounded-2xl bg-charcoal px-4 text-[14px] font-semibold text-white shadow-soft transition-all hover:bg-charcoal-hover active:scale-[0.99]"
      >
        <ScanLine
          className="h-[18px] w-[18px] text-cyan-300"
          strokeWidth={1.8}
        />
        <span>Profil Tubuh</span>
      </Link>
    </nav>
  );
}
