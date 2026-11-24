import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { EventCard } from "./EventCard";
import { CheckoutModal } from "../checkout/CheckoutModal";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";
import { getEventSaleStatus } from "../../shared/utils/eventStatus";

function EventGridSection({ title, events, onSeeAll }) {
  if (!events || events.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h2>

        {onSeeAll && (
          <button
            type="button"
            onClick={onSeeAll}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            ყველას ნახვა ({events.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.slice(0, 6).map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
      </div>
    </section>
  );
}

export function EventsPage() {
  const events = useEventStore((state) => state.events);

  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const selectedCategory = searchParams.get("cat") || "ALL";

  const [slideIndex, setSlideIndex] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  const heroSlides = events.slice(0, 4);
  const activeSlideIndex =
    heroSlides.length > 0 ? slideIndex % heroSlides.length : 0;
  const currentHero = heroSlides[activeSlideIndex] || null;
  const heroSaleStatus = currentHero
    ? getEventSaleStatus(currentHero, now)
    : null;
  const heroPricing = currentHero
    ? calculateDynamicPrice(currentHero.basePrice, currentHero.demandLevel)
    : null;

  const normalized = searchQuery.trim().toLowerCase();
  const isFiltering = Boolean(normalized) || selectedCategory !== "ALL";

  const filteredEvents = events.filter((ev) => {
    if (selectedCategory !== "ALL" && ev.category !== selectedCategory)
      return false;
    if (!normalized) return true;

    return (
      ev.title.toLowerCase().includes(normalized) ||
      (ev.organizerName || "").toLowerCase().includes(normalized) ||
      ev.location.toLowerCase().includes(normalized) ||
      ev.category.toLowerCase().includes(normalized)
    );
  });

  const liveEvents = events.filter((ev) => getEventSaleStatus(ev, now).isLive);
  const upcomingDrops = events.filter(
    (ev) => !getEventSaleStatus(ev, now).isLive
  );
  const uniqueCategories = Array.from(
    new Set(events.map((e) => e.category).filter(Boolean))
  );

  const selectCategory = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "ALL") {
      next.delete("cat");
    } else {
      next.set("cat", cat);
    }
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="space-y-12">
      {/* სუფთა ფართოფორმატიანი პოსტერ-ბანერი */}
      {!isFiltering && currentHero && (
        <section className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
          <div className="relative h-80 sm:h-104 w-full">
            <img
              src={currentHero.image}
              alt={currentHero.title}
              className="w-full h-full object-cover opacity-85"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

            {/* კონტენტი ქვედა ნაწილში */}
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="text-xs font-semibold text-indigo-400">
                  {currentHero.category}
                  {currentHero.organizerName
                    ? ` • ${currentHero.organizerName}`
                    : ""}
                </p>

                <Link
                  to={`/event/${currentHero.id}`}
                  className="block text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight hover:text-zinc-200 transition-colors"
                >
                  {currentHero.title}
                </Link>

                <p className="text-xs sm:text-sm text-zinc-300">
                  {currentHero.date} — {currentHero.location}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] text-zinc-400 block">
                    {heroSaleStatus.isLive ? "ბილეთის ფასი" : "გაყიდვა იწყება"}
                  </span>
                  <span className="text-lg font-extrabold font-mono-num text-white">
                    {heroSaleStatus.isLive
                      ? heroPricing.price === 0
                        ? "უფასო"
                        : `${formatPrice(heroPricing.price)}-დან`
                      : heroSaleStatus.formattedStart}
                  </span>
                </div>

                <Link
                  to={`/event/${currentHero.id}`}
                  className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition"
                >
                  {heroSaleStatus.isLive ? "ბილეთის ყიდვა" : "დეტალურად"}
                </Link>
              </div>
            </div>

            {/* სლაიდერის მართვა */}
            {heroSlides.length > 1 && (
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex(
                      (prev) =>
                        (prev - 1 + heroSlides.length) % heroSlides.length
                    )
                  }
                  aria-label="წინა"
                  className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex((prev) => (prev + 1) % heroSlides.length)
                  }
                  aria-label="შემდეგი"
                  className="w-8 h-8 rounded-lg bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ძიების ან კატეგორიის შედეგები */}
      {isFiltering ? (
        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                {selectedCategory !== "ALL"
                  ? selectedCategory
                  : "ძიების შედეგები"}
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                ნაპოვნია {filteredEvents.length} ღონისძიება
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#14161F] text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:border-zinc-900 dark:hover:border-white transition cursor-pointer"
            >
              ფილტრის მოხსნა
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] p-12 text-center space-y-2">
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                შესაბამისი ღონისძიება ვერ მოიძებნა
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 underline cursor-pointer"
              >
                ყველა ღონისძიების ჩვენება
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-12">
          <EventGridSection
            title="აქტუალური ღონისძიებები"
            events={liveEvents}
          />

          {upcomingDrops.length > 0 && (
            <EventGridSection title="მალე გაყიდვაში" events={upcomingDrops} />
          )}

          {uniqueCategories.map((cat) => (
            <EventGridSection
              key={cat}
              title={cat}
              events={events.filter((e) => e.category === cat)}
              onSeeAll={() => selectCategory(cat)}
            />
          ))}
        </div>
      )}

      <CheckoutModal />
    </div>
  );
}
