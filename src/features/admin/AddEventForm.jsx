import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  PlusCircle,
  Save,
  X,
  Plus,
  Trash2,
  Tag,
  Sparkles,
  Lock,
  Building2,
  Clock,
  AlignLeft,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80";

const TIER_PRESETS = [
  { name: "Standard", price: 50, quantity: 200 },
  { name: "Early Bird", price: 35, quantity: 50 },
  { name: "VIP", price: 150, quantity: 50 },
  { name: "Speaker", price: 0, quantity: 25 },
  { name: "Investor", price: 300, quantity: 40 },
  { name: "Media / Press", price: 0, quantity: 20 },
];

const PRESET_NAMES_LOWER = TIER_PRESETS.map((p) => p.name.toLowerCase());

const isPresetTier = (tier) =>
  Boolean(tier.isPreset) ||
  PRESET_NAMES_LOWER.includes(tier.name.trim().toLowerCase());

const eventSchema = yup.object({
  organizerName: yup
    .string()
    .trim()
    .min(2, "მიუთითეთ პარტნიორი კომპანია")
    .required("კომპანიის დასახელება სავალდებულოა"),
  title: yup
    .string()
    .trim()
    .min(4, "შეიყვანეთ ივენთის სახელი")
    .required("სავალდებულოა"),
  category: yup.string().trim().required("აირჩიეთ კატეგორია"),
  date: yup.string().trim().required("მიუთითეთ ჩატარების თარიღი და დრო"),
  location: yup.string().trim().required("მიუთითეთ ლოკაცია"),
  saleStartAt: yup.string().nullable(),
  image: yup
    .string()
    .url("შეიყვანეთ სწორი სურათის ბმული (URL)")
    .required("სურათის ბმული სავალდებულოა"),
  description: yup
    .string()
    .trim()
    .min(10, "აღწერა უნდა შეიცავდეს მინიმუმ 10 სიმბოლოს")
    .required("ღონისძიების აღწერა სავალდებულოა"),
});

export function AddEventForm({ isOpen, onClose, editingEvent }) {
  if (!isOpen) return null;

  return (
    <AddEventFormContent
      key={editingEvent?.id || "new-event"}
      onClose={onClose}
      editingEvent={editingEvent}
    />
  );
}

function AddEventFormContent({ onClose, editingEvent }) {
  const addEvent = useEventStore((state) => state.addEvent);
  const updateEvent = useEventStore((state) => state.updateEvent);

  const [tierError, setTierError] = useState("");

  const [tiers, setTiers] = useState(() => {
    if (!editingEvent) {
      return [
        {
          id: "init-1",
          name: "Standard",
          price: 50,
          quantity: 200,
          isPreset: true,
        },
      ];
    }
    if (editingEvent.ticketTiers?.length) {
      return editingEvent.ticketTiers.map((t) => ({
        ...t,
        isPreset: isPresetTier(t),
      }));
    }
    return [
      {
        id: "legacy-1",
        name: "Standard",
        price: editingEvent.basePrice,
        quantity: editingEvent.totalTickets,
        isPreset: true,
      },
    ];
  });

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTierName, setCustomTierName] = useState("");
  const [customTierPrice, setCustomTierPrice] = useState("");
  const [customTierQty, setCustomTierQty] = useState("");
  const [modalError, setModalError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: editingEvent
      ? {
          organizerName: editingEvent.organizerName || "",
          title: editingEvent.title,
          category: editingEvent.category,
          date: editingEvent.date,
          location: editingEvent.location,
          saleStartAt: editingEvent.saleStartAt || "",
          image: editingEvent.image,
          description: editingEvent.description || "",
        }
      : {
          organizerName: "",
          title: "",
          category: "კონფერენცია / ღონისძიება",
          date: "",
          location: "",
          saleStartAt: "",
          image: DEFAULT_IMAGE,
          description: "",
        },
  });

  const watchedSaleStart = useWatch({ control, name: "saleStartAt" });

  const handleAddPreset = (preset) => {
    setTierError("");
    const exists = tiers.some(
      (t) => t.name.toLowerCase() === preset.name.toLowerCase()
    );
    if (exists) {
      setTierError(`კატეგორია "${preset.name}" უკვე დამატებულია`);
      return;
    }
    setTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}-${preset.name}`,
        name: preset.name,
        price: preset.price,
        quantity: preset.quantity,
        isPreset: true,
      },
    ]);
  };

  const openCustomModal = () => {
    setCustomTierName("");
    setCustomTierPrice("");
    setCustomTierQty("");
    setModalError("");
    setTierError("");
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomTier = (e) => {
    e.preventDefault();
    setModalError("");

    const trimmedName = customTierName.trim();
    const parsedPrice = Number(customTierPrice);
    const parsedQty = Number(customTierQty);

    if (!trimmedName) {
      setModalError("შეიყვანეთ კატეგორიის სახელი (მაგ. Backstage, Student)");
      return;
    }
    if (tiers.some((t) => t.name.toLowerCase() === trimmedName.toLowerCase())) {
      setModalError(`კატეგორია "${trimmedName}" უკვე არსებობს`);
      return;
    }
    if (customTierPrice === "" || parsedPrice < 0) {
      setModalError("მიუთითეთ სწორი ფასი (0 ან მეტი)");
      return;
    }
    if (!parsedQty || parsedQty < 1) {
      setModalError("მიუთითეთ ბილეთების რაოდენობა (მინ. 1)");
      return;
    }

    setTiers((prev) => [
      ...prev,
      {
        id: `tier-${Date.now()}`,
        name: trimmedName,
        price: parsedPrice,
        quantity: parsedQty,
        isPreset: false,
      },
    ]);

    setIsCustomModalOpen(false);
  };

  const handleUpdateTierField = (id, field, value) => {
    setTiers((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (field === "name" && isPresetTier(t)) return t;
        return {
          ...t,
          [field]: field === "name" ? value : Math.max(0, Number(value)),
        };
      })
    );
  };

  const handleRemoveTier = (id) => {
    if (tiers.length <= 1) {
      setTierError("მინიმუმ 1 ბილეთის კატეგორია აუცილებელია");
      return;
    }
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const onSubmit = (data) => {
    if (tiers.length === 0) {
      setTierError("დაამატეთ მინიმუმ ერთი ბილეთის კატეგორია");
      return;
    }

    const paidTiers = tiers.filter((t) => t.price > 0);
    const calculatedBasePrice =
      paidTiers.length > 0
        ? Math.min(...paidTiers.map((t) => t.price))
        : tiers[0].price;
    const calculatedTotalTickets = tiers.reduce(
      (sum, t) => sum + Number(t.quantity),
      0
    );

    const payload = {
      organizerName: data.organizerName.trim(),
      title: data.title,
      category: data.category,
      date: data.date,
      location: data.location,
      saleStartAt: data.saleStartAt ? data.saleStartAt : null,
      image: data.image,
      description: data.description.trim(),
      basePrice: calculatedBasePrice,
      totalTickets: calculatedTotalTickets,
      ticketTiers: tiers,
    };

    if (editingEvent) {
      updateEvent(editingEvent.id, payload);
    } else {
      addEvent(payload);
    }

    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/65 backdrop-blur-xs overflow-y-auto">
        <div className="w-full max-w-2xl rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden my-auto max-h-[90dvh] flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                {editingEvent ? "რედაქტირება" : "EventPulse Onboarding"}
              </p>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                {editingEvent
                  ? editingEvent.title
                  : "ახალი ღონისძიების დამატება"}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 space-y-6 overflow-y-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                  <span>კომპანია / ორგანიზატორი</span>
                </label>
                <input
                  type="text"
                  placeholder="მაგ. Startup Grind Tbilisi / Mono Hall"
                  {...register("organizerName")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.organizerName && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.organizerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ღონისძიების სახელი
                </label>
                <input
                  type="text"
                  placeholder="მაგ. Tbilisi Tech & Startup Summit"
                  {...register("title")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.title && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  კატეგორია
                </label>
                <input
                  type="text"
                  {...register("category")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.category && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ჩატარების თარიღი და დრო
                </label>
                <input
                  type="text"
                  placeholder="20 დეკემბერი, 2026 • 18:00"
                  {...register("date")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.date && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.date.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ლოკაცია
                </label>
                <input
                  type="text"
                  placeholder="Radisson Blu Iveria, თბილისი"
                  {...register("location")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.location && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  <span>გაყიდვის დაწყების დრო (არასავალდებულო)</span>
                </label>
                <input
                  type="datetime-local"
                  {...register("saleStartAt")}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm font-mono-num text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                <span className="text-[10px] text-zinc-400 block mt-1">
                  {watchedSaleStart
                    ? "ამ დრომდე ივენთი გამოჩნდება ანონსად და ავტომატურად ჩაეშვება გაყიდვაში"
                    : "თუ ცარიელია — ბილეთების გაყიდვა მაშინვე დაიწყება"}
                </span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  ქავერის სურათის URL
                </label>
                <input
                  type="url"
                  {...register("image")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {errors.image && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.image.message}
                  </p>
                )}
              </div>

              {/* ღონისძიების აღწერა */}
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-zinc-400" />
                  <span>ღონისძიების აღწერა</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="დაწერეთ დეტალური ინფორმაცია ღონისძიების პროგრამაზე, სპიკერებზე/არტისტებზე, წესებსა და სხვა მნიშვნელოვან დეტალებზე..."
                  {...register("description")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition resize-y"
                />
                {errors.description && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* ბილეთის კატეგორიები */}
            <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>ბილეთის კატეგორიები ({tiers.length})</span>
                  </h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    აირჩიე შაბლონი ან დაამატე საკუთარი ტიპი
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCustomModal}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>+ საკუთარი კატეგორია</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {TIER_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleAddPreset(preset)}
                    className="px-2.5 py-1 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-white text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{preset.name}</span>
                    <span className="text-zinc-400 font-mono-num">
                      ({preset.price}₾)
                    </span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {tiers.map((tier) => {
                  const locked = isPresetTier(tier);
                  return (
                    <div
                      key={tier.id}
                      className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                    >
                      <div className="col-span-5">
                        {locked ? (
                          <div
                            title="შაბლონური კატეგორიის სახელი ფიქსირებულია"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-950/80 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-between gap-1.5 select-none"
                          >
                            <span className="truncate">{tier.name}</span>
                            <Lock className="w-3 h-3 text-zinc-400 shrink-0" />
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={tier.name}
                            onChange={(e) =>
                              handleUpdateTierField(
                                tier.id,
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="კატეგორია"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-white"
                          />
                        )}
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          {locked ? "შაბლონი" : "საკუთარი"}
                        </span>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="0"
                          value={tier.price}
                          onChange={(e) =>
                            handleUpdateTierField(
                              tier.id,
                              "price",
                              e.target.value
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-num text-zinc-900 dark:text-white"
                        />
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          ფასი (₾)
                        </span>
                      </div>

                      <div className="col-span-3">
                        <input
                          type="number"
                          min="1"
                          value={tier.quantity}
                          onChange={(e) =>
                            handleUpdateTierField(
                              tier.id,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-xs font-mono-num text-zinc-900 dark:text-white"
                        />
                        <span className="text-[10px] text-zinc-400 block mt-0.5">
                          რაოდენობა
                        </span>
                      </div>

                      <div className="col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(tier.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {tierError && (
                <p className="text-xs text-rose-500">{tierError}</p>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
              >
                გაუქმება
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                {editingEvent ? (
                  <>
                    <Save className="w-4 h-4" />
                    <span>ცვლილებების შენახვა</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>
                      {watchedSaleStart
                        ? "ჩანიშვნა & გამოქვეყნება"
                        : "ივენთის გამოქვეყნება"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isCustomModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold">
                  ახალი კატეგორია
                </p>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                  ბილეთის ტიპის დამატება
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  კატეგორიის სახელი
                </label>
                <input
                  type="text"
                  autoFocus
                  value={customTierName}
                  onChange={(e) => setCustomTierName(e.target.value)}
                  placeholder="მაგ. Backstage, Student, Mentor"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    ფასი (₾)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={customTierPrice}
                    onChange={(e) => setCustomTierPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm font-mono-num text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    რაოდენობა
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={customTierQty}
                    onChange={(e) => setCustomTierQty(e.target.value)}
                    placeholder="50"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-sm font-mono-num text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                  />
                </div>
              </div>

              {modalError && (
                <p className="text-xs text-rose-500">{modalError}</p>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                >
                  გაუქმება
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomTier}
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>დამატება</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
