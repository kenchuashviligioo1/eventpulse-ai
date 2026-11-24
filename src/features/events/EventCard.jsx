import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";
import { getEventSaleStatus } from "../../shared/utils/eventStatus";

export function EventCard({ event }) {
  const [now, setNow] = useState(() => Date.now());
  const saleStatus = getEventSaleStatus(event, now);

  useEffect(() => {
    if (saleStatus.isLive) return;

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [saleStatus.isLive]);

  const pricing = calculateDynamicPrice(event.basePrice, event.demandLevel);
  const remaining = Math.max(0, event.totalTickets - event.soldTickets);

  return (
    <Link
      to={`/event/${event.id}`}
      className="group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] overflow-hidden flex flex-col hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
    >
      {/* პოსტერი */}
      <div className="relative aspect-16/10 bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />

        {!saleStatus.isLive && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-zinc-950/85 text-white text-[11px] font-semibold">
            მალე იწყება
          </span>
        )}

        {saleStatus.isLive && remaining <= 0 && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-zinc-950/85 text-zinc-300 text-[11px] font-semibold">
            ამოწურულია
          </span>
        )}
      </div>

      {/* ტექსტური ინფორმაცია */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
            {event.date}
          </p>

          <h3 className="text-[15px] font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {event.title}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {event.location}
          </p>
        </div>

        {/* ქვედა ზოლი */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          {saleStatus.isLive ? (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm font-extrabold font-mono-num text-zinc-900 dark:text-white">
                  {pricing.price === 0
                    ? "უფასო"
                    : `${formatPrice(pricing.price)}-დან`}
                </span>
                {pricing.price !== event.basePrice && (
                  <span className="text-[11px] text-zinc-400 line-through font-mono-num">
                    {formatPrice(event.basePrice)}
                  </span>
                )}
              </div>

              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                ბილეთები
              </span>
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-xs">
              <span className="text-zinc-400">გაყიდვის სტარტი</span>
              <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                {saleStatus.formattedStart}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
