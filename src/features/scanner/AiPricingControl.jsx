import { useState } from "react";
import {
  Sliders,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  X,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";

export function AiPricingControl() {
  const events = useEventStore((state) => state.events);
  const updateEventDemand = useEventStore((state) => state.updateEventDemand);
  const [searchQuery, setSearchQuery] = useState("");

  const normalized = searchQuery.trim().toLowerCase();
  const filteredEvents = normalized
    ? events.filter(
        (ev) =>
          ev.title.toLowerCase().includes(normalized) ||
          ev.location.toLowerCase().includes(normalized) ||
          ev.category.toLowerCase().includes(normalized)
      )
    : events;

  return (
    <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
            AI Dynamic Pricing Engine
          </span>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5 flex items-center gap-2">
            <Sliders className="w-4 h-4" />
            <span>მოთხოვნის სიმულაცია</span>
          </h3>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          შეცვალე მოთხოვნა და ნახე ფასის კორექტირება
        </span>
      </div>

      {/* ძიების ველი */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="მოძებნე ღონისძიება სახელით, ლოკაციით ან კატეგორიით..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            aria-label="გასუფთავება"
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="p-8 text-center space-y-2 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            „{searchQuery}“ — ღონისძიება ვერ მოიძებნა
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="text-xs font-semibold text-zinc-900 dark:text-white underline cursor-pointer"
          >
            ძიების გასუფთავება
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((ev) => {
            const pricing = calculateDynamicPrice(ev.basePrice, ev.demandLevel);

            return (
              <div
                key={ev.id}
                className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {ev.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400">
                      {ev.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono-num">
                    <span className="text-zinc-400">
                      საბაზისო: {formatPrice(ev.basePrice)}
                    </span>
                    <span>→</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      ახალი: {formatPrice(pricing.price)}
                    </span>
                    {pricing.isHighDemand && (
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                    )}
                    {pricing.isDiscounted && (
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {!pricing.isHighDemand && !pricing.isDiscounted && (
                      <Minus className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={ev.demandLevel}
                    onChange={(e) =>
                      updateEventDemand(ev.id, Number(e.target.value))
                    }
                    className="flex-1 accent-zinc-900 dark:accent-white cursor-pointer"
                  />
                  <span className="w-16 text-right font-mono-num text-xs font-bold text-zinc-900 dark:text-white">
                    {ev.demandLevel}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
