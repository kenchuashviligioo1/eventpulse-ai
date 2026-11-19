import { Calendar, MapPin, Flame, ArrowRight } from "lucide-react";
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
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col hover:border-zinc-700 transition">
      {/* სურათი */}
      <div className="relative h-48 overflow-hidden bg-zinc-800">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

        {/* ბეჯი ჩანს მხოლოდ მაშინ, როცა მომხმარებლისთვის ფასდაკლებაა */}
        {pricing.isDiscounted && (
          <div className="absolute top-3 left-3">
            <Badge variant="success" pulse>
              {pricing.badgeText}
            </Badge>
          </div>
        )}

        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-zinc-300">
          <span className="px-2.5 py-1 rounded-md bg-zinc-950/80 backdrop-blur border border-zinc-800">
            {event.category}
          </span>
          {pricing.isHighDemand && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 backdrop-blur">
              <Flame className="w-3.5 h-3.5" />
              სწრაფად იყიდება
            </span>
          )}
        </div>
      </div>

      {/* კონტენტი */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-5">
        <div>
          <h3 className="text-lg font-bold text-white leading-snug">
            {event.title}
          </h3>
          <div className="mt-3 space-y-1.5 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-zinc-500 shrink-0" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        {/* ფასი და ყიდვის ღილაკი */}
        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono-num">
                {formatPrice(pricing.price)}
              </span>
              {pricing.isDiscounted && (
                <span className="text-xs text-zinc-500 line-through font-mono-num">
                  {formatPrice(event.basePrice)}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              დარჩა{" "}
              <span className="font-mono-num text-zinc-200">{remaining}</span>{" "}
              ბილეთი
            </p>
          </div>

          <button
            onClick={() => openCheckout(event.id)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-indigo-500/20"
          >
            <span>ყიდვა</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
