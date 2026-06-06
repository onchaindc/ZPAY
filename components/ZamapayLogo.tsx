"use client";

type ZamapayLogoProps = {
  compact?: boolean;
};

export default function ZamapayLogo({ compact = false }: ZamapayLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 shrink-0 rounded-lg bg-zama-gold shadow-gold">
        <span className="absolute left-2 top-2 h-2 w-6 skew-x-[-28deg] rounded-sm bg-midnight" />
        <span className="absolute left-2 top-[1.15rem] h-2 w-6 skew-x-[-28deg] rounded-sm bg-midnight" />
        <span className="absolute bottom-2 left-2 h-2 w-6 skew-x-[-28deg] rounded-sm bg-midnight" />
      </div>
      <div className={compact ? "hidden sm:block" : ""}>
        <p className="text-xl font-black leading-none text-white">
          zama<span className="text-zama-gold">pay</span>
        </p>
        {!compact ? (
          <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.28em] text-zama-soft">
            Secured by FHE
          </p>
        ) : null}
      </div>
    </div>
  );
}
