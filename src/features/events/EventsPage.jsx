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
      <section className="pb-8 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl space-y-2">
          <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold">
            თბილისი • 2026
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white tracking-tight">
            მომავალი ღონისძიებები
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
            აირჩიე სასურველი ღონისძიება, შეიძინე ბილეთი ონლაინ და მიიღე ციფრული
            საშვი პირდაპირ სმარტფონში.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}
