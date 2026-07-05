"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import ZpayLogo from "@/components/ZpayLogo";

export default function LandingPage() {
  const fullLine = "Confidential payments on Ethereum";
  const [typedLine, setTypedLine] = useState("");
  const [connectedAddress, setConnectedAddress] = useState("");

  useEffect(() => {
    const startDelay = window.setTimeout(() => {
      let index = 0;
      const typeInterval = window.setInterval(() => {
        index += 1;
        setTypedLine(fullLine.slice(0, index));

        if (index >= fullLine.length) {
          window.clearInterval(typeInterval);
        }
      }, 55);
    }, 280);

    return () => {
      window.clearTimeout(startDelay);
    };
  }, []);

  return (
    <main className="grid min-h-[100dvh] w-full max-w-screen place-items-center overflow-x-hidden p-4 md:p-8">
      <section className="welcome-stage flex w-full max-w-xl flex-col items-center justify-center text-center">
        <div className="welcome-logo w-full max-w-[420px]">
          <ZpayLogo />
        </div>

        <p className="welcome-typing mt-5 min-h-[1.5rem] text-center text-sm font-bold uppercase tracking-[0.24em] text-zama-soft md:min-h-[1.75rem]">
          {typedLine}
          <span className="welcome-caret-inline" aria-hidden="true" />
        </p>
        <p className="welcome-subcopy mt-3 max-w-md text-sm leading-6 text-zinc-400">
          Powered by Zama FHE
        </p>

        <div className="welcome-actions mt-8 flex w-full max-w-sm flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-center">
          <ConnectButton onConnected={setConnectedAddress} />
          <Link href="/dashboard" className="secondary-button">
            {connectedAddress ? "Proceed" : "Skip"}
          </Link>
        </div>
      </section>
    </main>
  );
}
