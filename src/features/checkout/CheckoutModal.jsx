import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { X, CreditCard, Wallet, CheckCircle2, Loader2 } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import {
  calculateDynamicPrice,
  formatPrice,
} from "../../shared/utils/formatters";

const checkoutSchema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(4, "შეიყვანეთ სრული სახელი და გვარი")
    .required("სახელი და გვარი სავალდებულოა"),
  email: yup
    .string()
    .email("ელ-ფოსტის ფორმატი არასწორია")
    .required("ელ-ფოსტა სავალდებულოა"),
  phone: yup
    .string()
    .matches(
      /^[0-9+\s-]{9,15}$/,
      "შეიყვანეთ სწორი ტელეფონის ნომერი (მაგ. 599 12 34 56)"
    )
    .required("ტელეფონის ნომერი სავალდებულოა"),
  paymentMethod: yup.string().oneOf(["card", "citypay"]).required(),
});

export function CheckoutModal() {
  const navigate = useNavigate();
  const events = useEventStore((state) => state.events);
  const selectedEventId = useEventStore((state) => state.selectedEventId);
  const closeCheckout = useEventStore((state) => state.closeCheckout);
  const addTicket = useEventStore((state) => state.addTicket);

  const [isProcessing, setIsProcessing] = useState(false);

  const event = events.find((e) => e.id === selectedEventId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      paymentMethod: "card",
    },
  });

  const paymentMethod = watch("paymentMethod");

  if (!event) return null;

  const pricing = calculateDynamicPrice(event.basePrice, event.demandLevel);

  const handleClose = () => {
    if (isProcessing) return;
    reset();
    closeCheckout();
  };

  const onSubmit = (data) => {
    setIsProcessing(true);

    // გადახდის სიმულაცია (1.2 წამი)
    setTimeout(() => {
      const randomSuffix = Math.floor(100000 + Math.random() * 900000);
      const newTicket = {
        id: `tkt-${Date.now()}`,
        code: `EP-${randomSuffix}`,
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventLocation: event.location,
        ownerName: data.fullName,
        ownerEmail: data.email,
        ownerPhone: data.phone,
        paymentMethod: data.paymentMethod,
        paidPrice: pricing.price,
        purchasedAt: new Date().toLocaleTimeString("ka-GE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        used: false,
        scannedAt: null,
      };

      addTicket(newTicket);
      setIsProcessing(false);
      reset();
      closeCheckout();
      navigate("/my-tickets");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* ჰედერი */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              ბილეთის გაფორმება
            </p>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-1 mt-0.5">
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

        {/* ფორმა */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* სახელი და გვარი */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              სახელი და გვარი
            </label>
            <input
              type="text"
              placeholder="მაგ. გიორგი კენჭუაშვილი"
              {...register("fullName")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
            />
            {errors.fullName && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* ელ-ფოსტა */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              ელ-ფოსტა
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              {...register("email")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* ტელეფონი */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              მობილურის ნომერი
            </label>
            <input
              type="tel"
              placeholder="597 13 23 21"
              {...register("phone")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition font-mono-num"
            />
            {errors.phone && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* გადახდის მეთოდი */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
              გადახდის მეთოდი
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setValue("paymentMethod", "card")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-zinc-900 dark:border-white bg-zinc-900/5 dark:bg-white/10 text-zinc-900 dark:text-white"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <CreditCard className="w-4 h-4 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">საბანკო ბარათი</div>
                  <div className="text-[10px] opacity-70">
                    Apple / Google Pay
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setValue("paymentMethod", "citypay")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition cursor-pointer ${
                  paymentMethod === "citypay"
                    ? "border-zinc-900 dark:border-white bg-zinc-900/5 dark:bg-white/10 text-zinc-900 dark:text-white"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                <Wallet className="w-4 h-4 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">CityPay.io</div>
                  <div className="text-[10px] opacity-70">USDT / Crypto</div>
                </div>
              </button>
            </div>
          </div>

          {/* ჯამური ფასი და ღილაკი */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                გადასახდელი თანხა
              </span>
              <div className="text-xl font-bold text-zinc-900 dark:text-white font-mono-num">
                {formatPrice(pricing.price)}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-sm font-semibold flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>მუშავდება...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>გადახდა</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
