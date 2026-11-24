import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Ticket,
  LogOut,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { formatPrice } from "../../shared/utils/formatters";

const USER_STORAGE_KEY = "eventpulse_public_user";

export function ProfilePage() {
  const navigate = useNavigate();
  const tickets = useEventStore((state) => state.tickets);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
    window.dispatchEvent(new Event("ep-user-updated"));
    navigate("/");
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141622] p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <User className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
            პროფილზე არ ხართ შესული
          </h1>
          <p className="text-xs text-zinc-500">
            დააჭირეთ ჰედერში „შესვლა“ ღილაკს თქვენი ბილეთებისა და პროფილის
            სანახავად.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
        >
          მთავარ გვერდზე დაბრუნება
        </Link>
      </div>
    );
  }

  const contactLower = user.contact.trim().toLowerCase();
  const personalTickets = tickets.filter(
    (t) =>
      t.ownerPhone?.toLowerCase() === contactLower ||
      t.ownerEmail?.toLowerCase() === contactLower
  );
  const displayedTickets =
    personalTickets.length > 0 ? personalTickets : tickets;

  const initials = user.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141622] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white text-xl font-extrabold flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/25">
            {initials || "EP"}
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ვერიფიცირებული მომხმარებელი</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
              {user.name}
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 inline-flex items-center gap-1.5 font-mono-num">
              <Phone className="w-3.5 h-3.5" />
              <span>{user.contact}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/my-tickets"
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>QR საშვები ({displayedTickets.length})</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:border-rose-400 hover:text-rose-500 flex items-center gap-1.5 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>გასვლა</span>
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#141622] overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            ჩემი შეძენილი ბილეთები ({displayedTickets.length})
          </h2>
          <Link
            to="/my-tickets"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1 hover:underline"
          >
            <span>QR კოდების გახსნა</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {displayedTickets.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <p className="text-xs text-zinc-500">
              ბილეთები ჯერ არ გაქვთ შეძენილი
            </p>
            <Link
              to="/"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 underline"
            >
              ღონისძიებების ნახვა
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {displayedTickets.map((t) => (
              <div
                key={t.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                    {t.eventTitle}
                  </span>
                  <span className="text-zinc-400">
                    კატეგორია: {t.tierName || "Standard"} • ID: {t.baseCode}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                    {t.paidPrice === 0 ? "უფასო" : formatPrice(t.paidPrice)}
                  </span>

                  {t.used ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      გამოყენებული
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      აქტიური
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
