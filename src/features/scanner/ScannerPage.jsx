import { useState } from "react";
import { ScanLine, SlidersHorizontal, LogOut } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { ScannerLogin } from "./ScannerLogin";
import { TicketScannerBox } from "./TicketScannerBox";
import { AiPricingControl } from "./AiPricingControl";

export function ScannerPage() {
  const isScannerAuth = useEventStore((state) => state.isScannerAuth);
  const logoutScanner = useEventStore((state) => state.logoutScanner);

  const [activeTab, setActiveTab] = useState("scanner"); // 'scanner' | 'ai-pricing'

  if (!isScannerAuth) {
    return <ScannerLogin />;
  }

  return (
    <div className="space-y-8">
      {/* ზედა პანელი */}
      <section className="pb-6 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold">
            ორგანიზატორის სივრცე
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            კონტროლი და ვალიდაცია
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* ტაბები */}
          <div className="p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-1">
            <button
              onClick={() => setActiveTab("scanner")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "scanner"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <ScanLine className="w-3.5 h-3.5" />
              <span>კარის სკანერი</span>
            </button>

            <button
              onClick={() => setActiveTab("ai-pricing")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                activeTab === "ai-pricing"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>AI ფასების მართვა</span>
            </button>
          </div>

          {/* გასვლა */}
          <button
            onClick={logoutScanner}
            title="სესიიდან გასვლა"
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* აქტიური ტაბის კონტენტი */}
      {activeTab === "scanner" ? <TicketScannerBox /> : <AiPricingControl />}
    </div>
  );
}
