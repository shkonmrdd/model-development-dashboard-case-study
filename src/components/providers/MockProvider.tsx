"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";

let workerStarted = false;

type MockProviderProps = {
  children: ReactNode;
};

export default function MockProvider({ children }: MockProviderProps) {
  const shouldMock = true;// process.env.NEXT_PUBLIC_API_MOCKING === "true"; commented out to avoid any confusion - always mock for the purpose of this case study
  const [ready, setReady] = useState(!shouldMock);

  useEffect(() => {
    if (!shouldMock) return;
    let active = true;

    const startWorker = async () => {
      if (!workerStarted) {
        const { worker } = await import("@/mocks/browser");
        await worker.start({ onUnhandledRequest: "bypass" });
        workerStarted = true;
      }
      if (active) {
        setReady(true);
      }
    };

    startWorker();

    return () => {
      active = false;
    };
  }, [shouldMock]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Starting API mocks...
      </div>
    );
  }

  return <>{children}</>;
}
