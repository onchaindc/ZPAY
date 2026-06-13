import SendForm from "@/components/SendForm";

export default function SendPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-normal text-zama-soft sm:text-sm">Send</p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">Send private ETH</h1>
      </div>
      <SendForm />
    </main>
  );
}
