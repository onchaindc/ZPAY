import SendForm from "@/components/SendForm";

export default function SendPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-normal text-zama-soft">Send</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Full private send flow</h1>
      </div>
      <SendForm />
    </main>
  );
}
