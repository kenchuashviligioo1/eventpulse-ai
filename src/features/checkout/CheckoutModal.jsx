import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  ShieldCheck,
  CreditCard,
  Wallet,
  CheckCircle2,
  Tag,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";

const checkoutSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(3, "შეიყვანეთ სახელი და გვარი")
    .required("სავალდებულო ველია"),
  phone: yup
    .string()
    .trim()
    .min(9, "შეიყვანეთ სწორი მობილურის ნომერი")
    .required("სავალდებულო ველია"),
  email: yup
    .string()
    .trim()
    .email("შეიყვანეთ სწორი ელ-ფოსტა")
    .required("სავალდებულო ველია"),
});

export function CheckoutModal() {
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const events = useEventStore((state) => state.events);
  const closeCheckout = useEventStore((state) => state.closeCheckout);
  const purchaseTicket = useEventStore((state) => state.purchaseTicket);

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [selectedTierId, setSelectedTierId] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const event = events.find((e) => e.id === selectedEventId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
    },
  });

  if (!event) return null;

  const availableTiers =
    event.ticketTiers?.length > 0
      ? event.ticketTiers
      : [
          {
            id: "default-standard",
            name: "Standard",
            price: event.basePrice,
            quantity: event.totalTickets,
          },
        ];

  const activeTier =
    availableTiers.find((t) => t.id === selectedTierId) || availableTiers[0];
  const pricing = calculateDynamicPrice(activeTier.price, event.demandLevel);

  const handleClose = () => {
    setIsSuccess(false);
    setSelectedTierId("");
    reset();
    closeCheckout();
  };

  const onSubmit = async (formData) => {
    await purchaseTicket({
      eventId: event.id,
      ownerName: formData.fullName,
      ownerPhone: formData.phone,
      ownerEmail: formData.email,
      tierId: activeTier.id,
      tierName: activeTier.name,
      paidPrice: pricing.price,
      paymentMethod,
    });
    setIsSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden max-h-[92dvh] flex flex-col">
        {/* ჰედერი */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold">
              Checkout
            </p>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1">
              {event.title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-zinc-900 dark:text-white">
                ბილეთი გააქტიურდა
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                კატეგორია:{" "}
                <strong className="text-zinc-900 dark:text-white">
                  {activeTier.name}
                </strong>{" "}
                • შენი დინამიკური QR საშვი დაემატა „ჩემი ბილეთების“ გვერდზე.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold cursor-pointer"
            >
              დახურვა
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-4 overflow-y-auto"
          >
            {/* ბილეთის კატეგორიის არჩევა */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-400" />
                <span>აირჩიე ბილეთის კატეგორია</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {availableTiers.map((tier) => {
                  const tierDynamic = calculateDynamicPrice(
                    tier.price,
                    event.demandLevel
                  );
                  const isSelected = activeTier.id === tier.id;

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                        isSelected
                          ? "border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400"
                      }`}
                    >
                      <span className="text-xs font-bold block truncate">
                        {tier.name}
                      </span>
                      <span
                        className={`text-sm font-mono-num font-bold mt-0.5 block ${
                          isSelected ? "" : "text-zinc-900 dark:text-white"
                        }`}
                      >
                        {tierDynamic.price === 0
                          ? "უფასო"
                          : formatPrice(tierDynamic.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* გადასახდელი თანხა */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between">
              <div>
                <span className="text-xs text-zinc-500 block">
                  {activeTier.name} • {pricing.label}
                </span>
                <span className="text-xs text-zinc-400">{event.date}</span>
              </div>
              <span className="text-xl font-bold text-zinc-900 dark:text-white font-mono-num">
                {pricing.price === 0 ? "0.00 ₾" : formatPrice(pricing.price)}
              </span>
            </div>

            {/* მფლობელის მონაცემები */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  სახელი და გვარი
                </label>
                <input
                  type="text"
                  placeholder="მაგ. გიორგი ბერიძე"
                  {...register("fullName")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  მობილურის ნომერი
                </label>
                <input
                  type="tel"
                  placeholder="555 12 34 56"
                  {...register("phone")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.phone && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  ელ-ფოსტა
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </div>

            {/* გადახდის მეთოდი */}
            {pricing.price > 0 && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  გადახდის მეთოდი
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>ბარათით</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("wallet")}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === "wallet"
                        ? "border-zinc-900 dark:border-white bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Apple / Google Pay</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition cursor-pointer"
            >
              {pricing.price === 0
                ? `${activeTier.name} საშვის მიღება`
                : `${formatPrice(pricing.price)} გადახდა და QR მიღება`}
            </button>

            <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>ბილეთი მიებმება დინამიკურ 30-წამიან QR დაცვას</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
