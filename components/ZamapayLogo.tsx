"use client";

import Image from "next/image";

type ZamapayLogoProps = {
  compact?: boolean;
};

export default function ZamapayLogo({ compact = false }: ZamapayLogoProps) {
  return (
    <div className="flex items-center">
      <Image
        src="/zamapay-logo.jpg"
        alt="ZAMAPAY"
        width={1200}
        height={1200}
        priority={compact}
        className={
          compact
            ? "h-12 w-auto max-w-[190px] rounded-sm object-contain"
            : "h-auto w-full max-w-[560px] rounded-lg object-contain"
        }
      />
    </div>
  );
}
