import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
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
    <article className="group rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-zinc-900 dark:hover:border-zinc-400 hover:shadow-xl hover:shadow-zinc-900/10 dark:hover:shadow-black/50">
      {/* სურათის კონტეინერი */}
      <div className="aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
      </div>

      {/* ტექსტური ნაწილი */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
              {event.date}
            </span>
            {pricing.isDiscounted && (
              <Badge variant="success">-15% სპეც. ფასი</Badge>
            )}
          </div>

          <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
            <span>{event.location}</span>
          </p>
        </div>

        {/* ქვედა ზოლი: ფასი და ღილაკი */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-zinc-900 dark:text-white font-mono-num">
                {formatPrice(pricing.price)}
              </span>
              {pricing.isDiscounted && (
                <span className="text-xs text-zinc-400 dark:text-zinc-500 line-through font-mono-num">
                  {formatPrice(event.basePrice)}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              დარჩენილია {remaining} ბილეთი
            </p>
          </div>

          <button
            onClick={() => openCheckout(event.id)}
            className="group/btn px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1 transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>ბილეთი</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
