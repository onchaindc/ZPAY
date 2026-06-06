import Link from "next/link";
import ConnectButton from "@/components/ConnectButton";
import ZamapayLogo from "@/components/ZamapayLogo";

const features = [
  {
    title: "Hidden Balance",
    text: "Encrypted balances stay unreadable until you choose to reveal them locally."
  },
  {
    title: "Private Transfer",
    text: "Transfer amounts are encrypted with FHE before your transaction is sent."
  },
  {
    title: "Selective Receipt",
    text: "Receipts prove payment details only to the sender and receiver."
  }
];

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] max-w-6xl flex-col px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid flex-1 gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-normal text-zama-soft">Zama FHEVM</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            ZAMAPAY
          </h1>
          <p className="mt-5 max-w-2xl text-2xl font-semibold text-zama-soft sm:text-3xl">
            Send privately. Prove selectively.
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300">
            Confidential token transfers with encrypted amounts, local reveals, and receipts for parties
            who need proof without making every payment public.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ConnectButton />
            <Link href="/dashboard" className="secondary-button">
              Open Dashboard
            </Link>
          </div>
        </div>

        <div className="glass rounded-lg p-5 shadow-glow sm:p-6">
          <div className="rounded-lg border border-zama-gold/18 bg-midnight/80 p-5">
            <div className="mb-5">
              <ZamapayLogo />
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-sm text-zinc-400">Encrypted amount</p>
                <p className="mt-2 text-4xl font-black text-white">••••</p>
              </div>
              <span className="rounded-lg bg-zama-gold/20 px-3 py-2 text-sm font-bold text-zama-gold">
                FHE
              </span>
            </div>
            <div className="mt-5 grid gap-3 text-sm text-zinc-300">
              <p className="flex justify-between gap-4">
                <span>Sender</span>
                <span className="font-semibold text-white">Connected wallet</span>
              </p>
              <p className="flex justify-between gap-4">
                <span>Receiver</span>
                <span className="font-semibold text-white">Encrypted recipient</span>
              </p>
              <p className="flex justify-between gap-4">
                <span>Receipt</span>
                <span className="font-semibold text-white">Selective</span>
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
