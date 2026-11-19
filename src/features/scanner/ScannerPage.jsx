import { useEffect } from "react";
import { useEventStore } from "../../store/useEventStore";
import { ScannerLogin } from "./ScannerLogin";
import { TicketScannerBox } from "./TicketScannerBox";

export function ScannerPage() {
  const theme = useEventStore((state) => state.theme);
  const isScannerAuth = useEventStore((state) => state.isScannerAuth);

  // რადგან MainLayout-ის გარეთ ვართ, თემას აქაც ვასინქრონებთ
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  if (!isScannerAuth) {
    return (
      <div className="h-dvh overflow-hidden flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#0B0B0C] text-zinc-900 dark:text-zinc-100">
        <div className="w-full max-w-md">
          <ScannerLogin />
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh overflow-hidden flex flex-col justify-center p-4 bg-[#FAFAFA] dark:bg-[#0B0B0C] text-zinc-900 dark:text-zinc-100">
      <TicketScannerBox />
    </div>
  );
}
