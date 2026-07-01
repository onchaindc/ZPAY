import Link from "next/link";
import ConnectButton from "@/components/ConnectButton";
import ZamapayLogo from "@/components/ZamapayLogo";

const features = [
  {
    title: "Shield Funds",
    text: "Move funds into a confidential balance protected by Zama FHE."
  },
  {
    title: "Send Confidential Payments",
    text: "Send encrypted payment amounts across Ethereum without exposing sensitive details."
  },
  {
    title: "Unshield Funds",
    text: "Reveal or prove payment information only when you choose."
  }
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <section className="grid flex-1 gap-6 py-5 sm:gap-8 sm:py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-bold uppercase tracking-normal text-zama-soft">Powered by Zama FHE</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            Confidential Payments on Ethereum.
          </h1>
          <p className="mt-4 max-w-2xl text-xl font-semibold text-zama-soft sm:mt-5 sm:text-3xl">
            Protect balances and payment information using Fully Homomorphic Encryption powered by Zama.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:mt-5 sm:leading-8">
            ZamaPay is the confidential payment layer for Ethereum, built for shielded balances,
            encrypted payment amounts, and selective disclosure when proof is required.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ConnectButton />
            <Link href="/dashboard" className="secondary-button">
              Enter ZamaPay
            </Link>
          </div>
        </div>

        <div className="glass min-w-0 rounded-lg p-4 shadow-glow sm:p-6">
          <div className="min-w-0 rounded-lg border border-zama-gold/18 bg-midnight/80 p-4 sm:p-5">
            <div className="mb-5">
              <ZamapayLogo />
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm text-zinc-400">Confidential amount</p>
                <p className="mt-2 text-4xl font-black text-white">••••</p>
              </div>
              <span className="rounded-lg bg-zama-gold/20 px-3 py-2 text-sm font-bold text-zama-gold">
                Zama FHE
              </span>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-zinc-300">
              <p className="flex justify-between gap-4">
                <span>Sender</span>
                <span className="min-w-0 text-right font-semibold text-white">Connected wallet</span>
              </p>
              <p className="flex justify-between gap-4">
                <span>Receiver</span>
                <span className="min-w-0 text-right font-semibold text-white">Encrypted recipient</span>
              </p>
              <p className="flex justify-between gap-4">
                <span>Disclosure</span>
                <span className="min-w-0 text-right font-semibold text-white">Selective</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 pb-10 sm:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="glass rounded-lg p-5">
            <h2 className="text-lg font-black text-white">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-300">{feature.text}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
