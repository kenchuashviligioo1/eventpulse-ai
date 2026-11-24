import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Clock,
  Share2,
  Check,
  ShieldCheck,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { CheckoutModal } from "../checkout/CheckoutModal";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";
import { getEventSaleStatus } from "../../shared/utils/eventStatus";

export function EventDetailsPage() {
  const { id } = useParams();
  const events = useEventStore((state) => state.events);
  const openCheckout = useEventStore((state) => state.openCheckout);

  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);

  const event = events.find((e) => String(e.id) === String(id));
  const saleStatus = event ? getEventSaleStatus(event, now) : null;

  useEffect(() => {
    if (!saleStatus || saleStatus.isLive) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [saleStatus]);

  if (!event) {
    return (
      <div className="max-w-lg mx-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] p-10 text-center space-y-4">
        <h1 className="text-lg font-extrabold text-zinc-900 dark:text-white">
          ღონისძიება ვერ მოიძებნა
        </h1>
        <p className="text-xs text-zinc-500">
          შესაძლოა ბმული მოძველდა ან ღონისძიება წაიშალა.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>მთავარ გვერდზე დაბრუნება</span>
        </Link>
      </div>
    );
  }

  const pricing = calculateDynamicPrice(event.basePrice, event.demandLevel);
  const remaining = Math.max(0, event.totalTickets - event.soldTickets);
  const eventDescription =
    event.description?.trim() ||
    `${event.title} გაიმართება ${event.location} სივრცეში (${event.date}). ადგილის დასაჯავშნად და ციფრული ბილეთის მისაღებად აირჩიეთ შესაბამისი კატეგორია.`;

  const tiers = event.ticketTiers?.length
    ? event.ticketTiers
    : [
        {
          id: "default-tier",
          name: "Standard",
          price: pricing.price,
          quantity: event.totalTickets,
        },
      ];

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ზედა ნავიგაცია */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ყველა ღონისძიება</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 inline-flex items-center gap-1.5 transition cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                ბმული დაკოპირდა
              </span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>გაზიარება</span>
            </>
          )}
        </button>
      </div>

      {/* პოსტერის ბანერი */}
      <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-950">
        <div className="relative h-64 sm:h-96 w-full">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/30 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 space-y-2">
            <p className="text-xs font-semibold text-indigo-400">
              {event.category}
              {event.organizerName ? ` • ${event.organizerName}` : ""}
            </p>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* ქვედა 2-სვეტიანი ბადე */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* მარცხენა სვეტი: დეტალები, აღწერა და ბილეთის კატეგორიები */}
        <div className="lg:col-span-8 space-y-6">
          {/* ძირითადი ინფორმაციის ბლოკი */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-zinc-400 block">
                  თარიღი და დრო
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {event.date}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-zinc-400 block">ლოკაცია</span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {event.location}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[11px] text-zinc-400 block">
                  ორგანიზატორი
                </span>
                <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                  {event.organizerName || "EventPulse"}
                </span>
              </div>
            </div>
          </div>

          {/* ღონისძიების აღწერის ბარათი */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] p-5 sm:p-6 space-y-3">
            <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white">
              ღონისძიების აღწერა
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {eventDescription}
            </p>
          </div>

          {/* ბილეთის კატეგორიები */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                ბილეთის კატეგორიები
              </h2>
              <span className="text-xs text-zinc-400 font-mono-num">
                დარჩენილია {remaining} ბილეთი
              </span>
            </div>

            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {tiers.map((tier) => {
                const tierPricing = calculateDynamicPrice(
                  tier.price,
                  event.demandLevel
                );
                return (
                  <div
                    key={tier.id}
                    className="px-5 sm:px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white block">
                        {tier.name}
                      </span>
                      <span className="text-xs text-zinc-400">
                        სექტორი / კატეგორია • რაოდენობა: {tier.quantity}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-base font-extrabold font-mono-num text-zinc-900 dark:text-white">
                        {tierPricing.price === 0
                          ? "უფასო"
                          : formatPrice(tierPricing.price)}
                      </span>

                      {saleStatus.isLive && remaining > 0 && (
                        <button
                          type="button"
                          onClick={() => openCheckout(event)}
                          className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition cursor-pointer"
                        >
                          არჩევა
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* მარჯვენა სვეტი: შეძენის ბარათი */}
        <div className="lg:col-span-4">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#14161F] p-6 space-y-5 sticky top-24">
            <div className="flex items-baseline justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ბილეთის ფასი
              </span>
              <span className="text-2xl font-extrabold font-mono-num text-zinc-900 dark:text-white">
                {pricing.price === 0
                  ? "უფასო"
                  : `${formatPrice(pricing.price)}-დან`}
              </span>
            </div>

            {saleStatus.isLive ? (
              <button
                type="button"
                disabled={remaining <= 0}
                onClick={() => openCheckout(event)}
                className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-400 text-white text-sm font-bold transition cursor-pointer disabled:cursor-not-allowed"
              >
                {remaining <= 0 ? "ბილეთები ამოწურულია" : "ბილეთის შეძენა"}
              </button>
            ) : (
              <div className="p-4 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-center space-y-1">
                <span className="text-xs text-zinc-500 inline-flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  <span>გაყიდვა იწყება</span>
                </span>
                <span className="block font-mono-num text-sm font-extrabold text-zinc-900 dark:text-white">
                  {saleStatus.formattedStart}
                </span>
              </div>
            )}

            <div className="flex items-start gap-2.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>
                ბილეთის შეძენის შემდეგ ციფრული QR საშვი ავტომატურად აისახება
                „ჩემი ბილეთების“ გვერდზე.
              </span>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal />
    </div>
  );
}
