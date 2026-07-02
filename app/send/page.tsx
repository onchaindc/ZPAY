import SendForm from "@/components/SendForm";

export default function SendPage() {
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
      <div className="mb-7 max-w-3xl md:mb-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Confidential Payment</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
          Send a confidential payment.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
          Encrypt the amount locally, confirm the recipient, and settle on Ethereum without exposing payment value.
        </p>
      </div>

      <SendForm />
    </main>
  );
}
