import SendForm from "@/components/SendForm";

export default function SendPage() {
  return (
    <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-5">
      <div className="mx-auto mb-5 max-w-3xl text-center md:mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Confidential Payment</p>
        <h1 className="mt-2 text-[1.85rem] font-black leading-tight text-white md:mt-2 md:text-[2.9rem]">
          Send a confidential payment.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:mt-3 md:text-base">
          Encrypt the amount locally, confirm the recipient, and settle on Ethereum without exposing payment value.
        </p>
      </div>

      <SendForm />
    </main>
  );
}
