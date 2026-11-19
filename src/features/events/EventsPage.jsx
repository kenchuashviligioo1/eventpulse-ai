import { ShieldCheck, Zap, Gift } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { EventCard } from "./EventCard";

export function EventsPage() {
  const events = useEventStore((state) => state.events);

  return (
    <div className="space-y-8">
      {/* მომხმარებლის Hero სექცია */}
      <section className="relative rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-indigo-950/30 p-6 sm:p-10 overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
            აღმოაჩინე გამორჩეული ღონისძიებები
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            შეიძინე ბილეთი წამებში, მიიღე დაცული ციფრული საშვი და ისარგებლე
            პარტნიორი ბრენდების ექსკლუზიური შეთავაზებებით ადგილზე.
          </p>

          <div className="pt-2 flex flex-wrap gap-5 text-xs text-zinc-300">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>მომენტალური გადახდა</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>გაყალბებისგან დაცული QR საშვი</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>ბონუსები სპონსორების სტენდებთან</span>
            </div>
          </div>
        </div>
      </section>

      {/* ივენთების სია */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            მიმდინარე ღონისძიებები
          </h2>
          <span className="text-xs text-zinc-400">
            {events.length} ღონისძიება
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
}
