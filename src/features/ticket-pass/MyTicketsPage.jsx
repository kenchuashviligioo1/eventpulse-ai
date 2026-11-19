import { Link } from "react-router-dom";
import { Ticket, ArrowRight } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { DynamicTicketCard } from "./DynamicTicketCard";

export function MyTicketsPage() {
  const tickets = useEventStore((state) => state.tickets);
  const myTicketIds = useEventStore((state) => state.myTicketIds);

  const myTickets = tickets.filter((t) => myTicketIds.includes(t.id));

  return (
    <div className="space-y-8">
      <section className="pb-6 border-b border-zinc-200 dark:border-zinc-800 flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-semibold">
            ციფრული საფულე
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
            ჩემი ბილეთები
          </h1>
        </div>
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono-num">
          სულ: {myTickets.length}
        </span>
      </section>

      {myTickets.length === 0 ? (
        <div className="rounded-2xl border-[1.5px] border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center mx-auto text-zinc-500">
            <Ticket className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              ჯერ ბილეთი არ გაქვს შეძენილი
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              აირჩიე სასურველი ღონისძიება მთავარი გვერდიდან და მიიღე 30-წამიანი
              დაცული QR საშვი.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold transition"
          >
            <span>ღონისძიებების ნახვა</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {myTickets.map((ticket) => (
            <DynamicTicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
