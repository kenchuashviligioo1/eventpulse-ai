import { ArrowUpRight } from "lucide-react";
import { Badge } from "../../shared/components/Badge";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";
import { useEventStore } from "../../store/useEventStore";

export function EventCard({ event }) {
  const openCheckout = useEventStore((state) => state.openCheckout);

  const pricing = calculateDynamicPrice(event.basePrice, event.demandLevel);
  const remaining = event.totalTickets - event.soldTickets;

  return (
    <article className="group rounded-xl border border-white/8 bg-[#111111] overflow-hidden flex flex-col hover:border-white/20 transition-colors">
      {/* სუფთა სურათი ზედმეტი წარწერების გარეშე */}
      <div className="aspect-16/10 overflow-hidden bg-zinc-900">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
      </div>

      {/* ტექსტური ნაწილი */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-400">
            <span>{event.date}</span>
            {pricing.isDiscounted && (
              <Badge variant="success">-15% სპეც. ფასი</Badge>
            )}
          </div>

          <h3 className="text-base font-semibold text-white leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-zinc-500">{event.location}</p>
        </div>

        {/* ქვედა ზოლი: ფასი და მოქმედება */}
        <div className="pt-4 border-t border-white/6 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold text-white font-mono-num">
                {formatPrice(pricing.price)}
              </span>
              {pricing.isDiscounted && (
                <span className="text-xs text-zinc-500 line-through font-mono-num">
                  {formatPrice(event.basePrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              დარჩენილია {remaining} ბილეთი
            </p>
          </div>

          <button
            onClick={() => openCheckout(event.id)}
            className="px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>ბილეთი</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
