import { useState } from "react";
import { useEventStore } from "../../store/useEventStore";
import { EventCard } from "./EventCard";

export function EventsPage() {
  const events = useEventStore((state) => state.events);
  const [selectedCategory, setSelectedCategory] = useState("ყველა");

  const categories = ["ყველა", ...new Set(events.map((e) => e.category))];

  const filteredEvents =
    selectedCategory === "ყველა"
      ? events
      : events.filter((e) => e.category === selectedCategory);

  return (
    <div className="space-y-10">
      {/* სუფთა, მინიმალისტური სათაური */}
      <section className="pb-8 border-b border-white/8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl space-y-2.5">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium">
            თბილისი • 2026
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            მომავალი ღონისძიებები
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            აირჩიე სასურველი ღონისძიება, შეიძინე ბილეთი ონლაინ და მიიღე ციფრული
            საშვი პირდაპირ სმარტფონში.
          </p>
        </div>

        {/* კატეგორიების ფილტრი */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-black"
                  : "bg-white/4 text-zinc-400 hover:text-white hover:bg-white/8"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ივენთების ბადე */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}
