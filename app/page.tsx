import Link from "next/link";
import ConnectButton from "@/components/ConnectButton";
import ZamapayLogo from "@/components/ZamapayLogo";

export default function LandingPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-112px)] max-w-5xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex w-full max-w-xl flex-col items-center text-center">
        <div className="w-full max-w-[420px]">
          <ZamapayLogo />
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-[0.24em] text-zama-soft">
          Confidential payments on Ethereum
        </p>
        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
          Powered by Zama FHE
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center">
          <ConnectButton />
          <Link href="/dashboard" className="secondary-button">
            Skip
          </Link>
        </div>
      </section>
    </main>
  );
}
