import SendForm from "@/components/SendForm";

export default function SendPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-7 max-w-3xl sm:mb-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft sm:text-sm">Send</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
          Send a confidential payment.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
          Encrypt the amount locally, confirm the recipient, and send without exposing payment value on-chain.
        </p>
      </div>

      <SendForm />
    </main>
  );
}
