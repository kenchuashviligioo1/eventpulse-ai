import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";
import { Badge } from "../../shared/components/Badge";

export function AiPricingControl() {
  const events = useEventStore((state) => state.events);
  const updateEventDemand = useEventStore((state) => state.updateEventDemand);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {events.map((event) => {
          const pricing = calculateDynamicPrice(
            event.basePrice,
            event.demandLevel
          );
          const diff = +(pricing.price - event.basePrice).toFixed(2);

          return (
            <div
              key={event.id}
              className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-5 flex flex-col justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {pricing.isDiscounted ? (
                    <Badge variant="success">Smart Drop (-15%)</Badge>
                  ) : pricing.isHighDemand ? (
                    <Badge variant="warning">პიკური ტარიფი (+20%)</Badge>
                  ) : (
                    <Badge variant="default">საბაზისო ტარიფი</Badge>
                  )}

                  <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono-num">
                    <Users className="w-3.5 h-3.5" />
                    {event.activeUsers}
                  </span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug pt-1">
                  {event.title}
                </h3>
              </div>

              {/* სლაიდერი */}
              <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">
                    მოთხოვნის ინდექსი
                  </span>
                  <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                    {event.demandLevel}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={event.demandLevel}
                  onChange={(e) =>
                    updateEventDemand(event.id, Number(e.target.value))
                  }
                  className="w-full accent-zinc-900 dark:accent-white cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>0–30% (Drop)</span>
                  <span>31–74% (ნორმა)</span>
                  <span>75%+ (პიკი)</span>
                </div>
              </div>

              {/* ფასის შედარება */}
              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400 block">საწყისი ფასი</span>
                  <span className="font-mono-num font-semibold text-zinc-600 dark:text-zinc-300">
                    {formatPrice(event.basePrice)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-zinc-400 block">AI მიმდინარე ფასი</span>
                  <div className="flex items-center justify-end gap-1.5 font-mono-num font-bold text-base text-zinc-900 dark:text-white">
                    <span>{formatPrice(pricing.price)}</span>
                    {diff > 0 && (
                      <TrendingUp className="w-4 h-4 text-amber-500" />
                    )}
                    {diff < 0 && (
                      <TrendingDown className="w-4 h-4 text-emerald-500" />
                    )}
                    {diff === 0 && <Minus className="w-4 h-4 text-zinc-400" />}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
