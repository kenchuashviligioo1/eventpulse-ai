import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarPlus,
  SlidersHorizontal,
  Ticket,
  LogOut,
  Sun,
  Moon,
  ArrowUpRight,
  ArrowLeft,
  Users,
  Wallet,
  CheckCircle2,
  Clock,
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  Calendar,
  MapPin,
  CreditCard,
  Building2,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";
import { ScannerLogin } from "../scanner/ScannerLogin";
import { AiPricingControl } from "../scanner/AiPricingControl";
import { AddEventForm } from "./AddEventForm";
import { formatPrice } from "../../shared/utils/formatters";
import { getEventSaleStatus } from "../../shared/utils/eventStatus";
import { Badge } from "../../shared/components/Badge";

const NAV_ITEMS = [
  { id: "overview", label: "მიმოხილვა", icon: LayoutDashboard },
  { id: "events", label: "ღონისძიებები", icon: CalendarPlus },
  { id: "ai-pricing", label: "AI ფასების მართვა", icon: SlidersHorizontal },
  { id: "tickets", label: "გაყიდული ბილეთები", icon: Ticket },
];

export function AdminPage() {
  const theme = useEventStore((state) => state.theme);
  const toggleTheme = useEventStore((state) => state.toggleTheme);
  const isScannerAuth = useEventStore((state) => state.isScannerAuth);
  const logoutScanner = useEventStore((state) => state.logoutScanner);
  const events = useEventStore((state) => state.events);
  const deleteEvent = useEventStore((state) => state.deleteEvent);
  const tickets = useEventStore((state) => state.tickets);

  const [activeSection, setActiveSection] = useState("overview");
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventSearch, setEventSearch] = useState("");
  const [saleStatusFilter, setSaleStatusFilter] = useState("all"); // 'all' | 'live' | 'scheduled'

  // მიმდინარე დრო ავტომატური სტატუსის განახლებისთვის
  const [now, setNow] = useState(() => Date.now());

  const [selectedTicketsEventId, setSelectedTicketsEventId] = useState(null);
  const [ticketEventSearch, setTicketEventSearch] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  if (!isScannerAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAFAFA] dark:bg-[#0B0B0C] text-zinc-900 dark:text-zinc-100">
        <div className="w-full max-w-md">
          <ScannerLogin />
        </div>
      </div>
    );
  }

  const totalRevenue = tickets.reduce(
    (sum, t) => sum + (Number(t.paidPrice) || 0),
    0
  );
  const scheduledEvents = events.filter(
    (ev) => !getEventSaleStatus(ev, now).isLive
  );
  const liveEventsCount = events.length - scheduledEvents.length;
  const partnerCompaniesCount = new Set(
    events.map((e) => (e.organizerName || "EventPulse").trim().toLowerCase())
  ).size;

  // ღონისძიებების ტაბის ფილტრაცია
  const normalizedEventQuery = eventSearch.trim().toLowerCase();
  const filteredEvents = events.filter((ev) => {
    const status = getEventSaleStatus(ev, now);
    if (saleStatusFilter === "live" && !status.isLive) return false;
    if (saleStatusFilter === "scheduled" && status.isLive) return false;

    if (!normalizedEventQuery) return true;

    const matchBasic =
      ev.title.toLowerCase().includes(normalizedEventQuery) ||
      (ev.organizerName || "").toLowerCase().includes(normalizedEventQuery) ||
      ev.location.toLowerCase().includes(normalizedEventQuery) ||
      ev.category.toLowerCase().includes(normalizedEventQuery);
    const matchTier = ev.ticketTiers?.some((t) =>
      t.name.toLowerCase().includes(normalizedEventQuery)
    );
    return matchBasic || matchTier;
  });

  // გაყიდული ბილეთების ტაბის ფილტრაცია
  const selectedTicketsEvent =
    events.find((e) => e.id === selectedTicketsEventId) || null;

  const normalizedTicketEventQuery = ticketEventSearch.trim().toLowerCase();
  const filteredTicketEvents = normalizedTicketEventQuery
    ? events.filter(
        (ev) =>
          ev.title.toLowerCase().includes(normalizedTicketEventQuery) ||
          (ev.organizerName || "")
            .toLowerCase()
            .includes(normalizedTicketEventQuery) ||
          ev.location.toLowerCase().includes(normalizedTicketEventQuery) ||
          ev.date.toLowerCase().includes(normalizedTicketEventQuery)
      )
    : events;

  const eventSpecificTickets = selectedTicketsEvent
    ? tickets.filter((t) => t.eventId === selectedTicketsEvent.id)
    : [];

  const normalizedTicketQuery = ticketSearch.trim().toLowerCase();
  const filteredEventTickets = normalizedTicketQuery
    ? eventSpecificTickets.filter(
        (t) =>
          t.ownerName?.toLowerCase().includes(normalizedTicketQuery) ||
          t.ownerPhone?.toLowerCase().includes(normalizedTicketQuery) ||
          t.ownerEmail?.toLowerCase().includes(normalizedTicketQuery) ||
          t.baseCode?.toLowerCase().includes(normalizedTicketQuery) ||
          (t.tierName || "standard")
            .toLowerCase()
            .includes(normalizedTicketQuery)
      )
    : eventSpecificTickets;

  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setIsEventModalOpen(true);
  };

  const handleStartEdit = (ev) => {
    setEditingEvent(ev);
    setIsEventModalOpen(true);
  };

  const handleCloseEventModal = () => {
    setIsEventModalOpen(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (ev) => {
    if (editingEvent?.id === ev.id) {
      handleCloseEventModal();
    }
    if (selectedTicketsEventId === ev.id) {
      setSelectedTicketsEventId(null);
    }
    deleteEvent(ev.id);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFA] dark:bg-[#0B0B0C] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* გვერდითი მენიუ (Sidebar) */}
      <aside className="w-full lg:w-68 lg:min-h-screen shrink-0 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between">
        <div className="p-4 lg:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
                EP
              </div>
              <div>
                <span className="text-sm font-bold tracking-tight block leading-none">
                  EventPulse
                </span>
                <span className="text-[11px] text-zinc-400 font-medium">
                  Master Admin
                </span>
              </div>
            </div>

            <div className="flex lg:hidden items-center gap-1.5">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 cursor-pointer"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={logoutScanner}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-rose-500 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id === "tickets") {
                      setSelectedTicketsEventId(null);
                      setTicketSearch("");
                    }
                  }}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden lg:block p-6 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
          <Link
            to="/"
            className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 flex items-center justify-between transition"
          >
            <span>საჯარო საიტი</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {theme === "light" ? (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </>
              )}
            </button>

            <button
              onClick={logoutScanner}
              className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>გასვლა</span>
            </button>
          </div>
        </div>
      </aside>

      {/* მარჯვენა მთავარი სამუშაო არე */}
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl w-full mx-auto space-y-8">
        {/* სექცია 1: მიმოხილვა */}
        {activeSection === "overview" && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                EventPulse • მიმოხილვა
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                პარტნიორი კომპანიების ღონისძიებები, ჩანიშნული გაყიდვები და
                საერთო ბრუნვა
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium">ჯამური ბრუნვა</span>
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono-num text-zinc-900 dark:text-white">
                  {formatPrice(totalRevenue)}
                </div>
              </div>

              <div className="p-5 rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium">
                    პარტნიორი კომპანიები
                  </span>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono-num text-zinc-900 dark:text-white">
                  {partnerCompaniesCount}
                </div>
              </div>

              <div className="p-5 rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium">
                    გაყიდვაში / ჩანიშნული
                  </span>
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono-num text-zinc-900 dark:text-white">
                  {liveEventsCount}{" "}
                  <span className="text-sm font-normal text-zinc-400">
                    / {scheduledEvents.length} მალე
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-zinc-400">
                  <span className="text-xs font-medium">გაყიდული ბილეთები</span>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold font-mono-num text-zinc-900 dark:text-white">
                  {tickets.length}
                </div>
              </div>
            </div>

            {/* სამომავლოდ ჩანიშნული გაყიდვების სია */}
            {scheduledEvents.length > 0 && (
              <div className="rounded-2xl border-[1.5px] border-amber-300 dark:border-amber-500/40 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span>ჩანიშნული გაყიდვები ({scheduledEvents.length})</span>
                  </h2>
                  <span className="text-[11px] text-zinc-400">
                    მითითებულ დროს ავტომატურად ჩაეშვება
                  </span>
                </div>
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {scheduledEvents.map((ev) => {
                    const status = getEventSaleStatus(ev, now);
                    return (
                      <div
                        key={ev.id}
                        className="px-6 py-3.5 flex items-center justify-between gap-4 text-xs"
                      >
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white block">
                            {ev.title}
                          </span>
                          <span className="text-zinc-400">
                            {ev.organizerName || "EventPulse"} • ივენთის თარიღი:{" "}
                            {ev.date}
                          </span>
                        </div>
                        <Badge variant="warning">
                          იწყება: {status.formattedStart}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ბოლო გაყიდული ბილეთები */}
            <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  ბოლო შეძენილი ბილეთები
                </h2>
                <button
                  onClick={() => {
                    setSelectedTicketsEventId(null);
                    setActiveSection("tickets");
                  }}
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                >
                  ყველას ნახვა →
                </button>
              </div>

              {tickets.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400">
                  ჯერ ბილეთი არ გაყიდულა
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {tickets.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-white block">
                          {t.ownerName}
                        </span>
                        <span className="text-zinc-400">
                          {t.eventTitle} • {t.tierName || "Standard"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                          {formatPrice(t.paidPrice)}
                        </span>
                        {t.used ? (
                          <Badge variant="default">დასკანერებული</Badge>
                        ) : (
                          <Badge variant="success">აქტიური</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* სექცია 2: კომპანიების ღონისძიებები & გაყიდვების განრიგი */}
        {activeSection === "events" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                  ღონისძიებები & კომპანიები
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  მონიშნე გაყიდვის დაწყების თარიღი — დროის მოსვლისას ავტომატურად
                  ჩაეშვება საჯაროდ
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ახალი ღონისძიების დამატება</span>
              </button>
            </div>

            {/* ძიება + სტატუსის ფილტრი */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={eventSearch}
                  onChange={(e) => setEventSearch(e.target.value)}
                  placeholder="მოძებნე ღონისძიება, კომპანია, ლოკაცია ან ბილეთის ტიპი..."
                  className="w-full pl-10 pr-9 py-2.5 rounded-xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                />
                {eventSearch && (
                  <button
                    type="button"
                    onClick={() => setEventSearch("")}
                    aria-label="ძიების გასუფთავება"
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 self-start">
                {[
                  { id: "all", label: `ყველა (${events.length})` },
                  { id: "live", label: `გაყიდვაშია (${liveEventsCount})` },
                  {
                    id: "scheduled",
                    label: `ჩანიშნული (${scheduledEvents.length})`,
                  },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSaleStatusFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      saleStatusFilter === tab.id
                        ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  ღონისძიებების სია ({filteredEvents.length})
                </h2>
              </div>

              {filteredEvents.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    შესაბამისი ღონისძიება ვერ მოიძებნა
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEventSearch("");
                      setSaleStatusFilter("all");
                    }}
                    className="text-xs font-semibold text-zinc-900 dark:text-white underline cursor-pointer"
                  >
                    ფილტრის გასუფთავება
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {filteredEvents.map((ev) => {
                    const saleStatus = getEventSaleStatus(ev, now);
                    return (
                      <div
                        key={ev.id}
                        className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <img
                            src={ev.image}
                            alt={ev.title}
                            className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {ev.organizerName && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold">
                                  <Building2 className="w-2.5 h-2.5" />
                                  {ev.organizerName}
                                </span>
                              )}
                              {saleStatus.isLive ? (
                                <Badge variant="success">გაყიდვაშია</Badge>
                              ) : (
                                <Badge variant="warning">
                                  <span className="inline-flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>
                                      იწყება: {saleStatus.formattedStart}
                                    </span>
                                  </span>
                                </Badge>
                              )}
                            </div>

                            <span className="font-bold text-sm text-zinc-900 dark:text-white block">
                              {ev.title}
                            </span>

                            <span className="text-zinc-400 block">
                              {ev.date} • {ev.location}
                            </span>

                            {ev.ticketTiers?.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-0.5">
                                {ev.ticketTiers.map((tier) => (
                                  <span
                                    key={tier.id}
                                    className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-medium text-zinc-600 dark:text-zinc-300"
                                  >
                                    {tier.name}: {tier.price}₾
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-left sm:text-right font-mono-num">
                            <span className="font-bold text-zinc-900 dark:text-white block">
                              {formatPrice(ev.basePrice)}-დან
                            </span>
                            <span className="text-zinc-400">
                              {ev.soldTickets}/{ev.totalTickets} ბილეთი
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(ev)}
                              title="რედაქტირება"
                              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-white hover:text-zinc-900 dark:hover:text-white transition cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev)}
                              title="წაშლა"
                              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-rose-300 dark:hover:border-rose-500/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <AddEventForm
              isOpen={isEventModalOpen}
              onClose={handleCloseEventModal}
              editingEvent={editingEvent}
            />
          </div>
        )}

        {/* სექცია 3: AI ფასების მართვა */}
        {activeSection === "ai-pricing" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                AI ფასების მართვა
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                მოთხოვნის ინდექსის მიხედვით ფასების ავტომატური კორექტირება
              </p>
            </div>

            <AiPricingControl />
          </div>
        )}

        {/* სექცია 4: გაყიდული ბილეთები */}
        {activeSection === "tickets" && (
          <div className="space-y-6">
            {!selectedTicketsEvent ? (
              <>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                    გაყიდული ბილეთები
                  </h1>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    აირჩიე ღონისძიება, რომლის გაყიდული ბილეთების ნახვაც გსურს
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={ticketEventSearch}
                    onChange={(e) => setTicketEventSearch(e.target.value)}
                    placeholder="მოძებნე ღონისძიება სახელით, კომპანიით, ლოკაციით ან თარიღით..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                  />
                  {ticketEventSearch && (
                    <button
                      type="button"
                      onClick={() => setTicketEventSearch("")}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {filteredTicketEvents.length === 0 ? (
                  <div className="rounded-2xl border-[1.5px] border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900/50 p-10 text-center space-y-2">
                    <p className="text-xs text-zinc-500">
                      „{ticketEventSearch}“ — ღონისძიება ვერ მოიძებნა
                    </p>
                    <button
                      type="button"
                      onClick={() => setTicketEventSearch("")}
                      className="text-xs font-semibold text-zinc-900 dark:text-white underline cursor-pointer"
                    >
                      ძიების გასუფთავება
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTicketEvents.map((ev) => {
                      const evTickets = tickets.filter(
                        (t) => t.eventId === ev.id
                      );
                      const evUsedCount = evTickets.filter(
                        (t) => t.used
                      ).length;
                      const evRevenue = evTickets.reduce(
                        (sum, t) => sum + (Number(t.paidPrice) || 0),
                        0
                      );

                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={() => {
                            setSelectedTicketsEventId(ev.id);
                            setTicketSearch("");
                          }}
                          className="text-left rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-900 dark:hover:border-white shadow-sm p-5 space-y-4 transition cursor-pointer group"
                        >
                          <div className="flex items-start gap-3.5">
                            <img
                              src={ev.image}
                              alt={ev.title}
                              className="w-14 h-14 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[11px] font-medium text-zinc-400 block">
                                {ev.organizerName
                                  ? `${ev.organizerName} • `
                                  : ""}
                                {ev.category}
                              </span>
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate mt-0.5 group-hover:underline">
                                {ev.title}
                              </h3>
                              <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-1">
                                <span className="inline-flex items-center gap-1 truncate">
                                  <Calendar className="w-3 h-3 shrink-0" />
                                  {ev.date}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-[11px] text-zinc-400 block">
                                გაყიდული
                              </span>
                              <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                                {evTickets.length} ბილეთი
                              </span>
                            </div>
                            <div>
                              <span className="text-[11px] text-zinc-400 block">
                                შემოსული
                              </span>
                              <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                                {evUsedCount} / {evTickets.length}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] text-zinc-400 block">
                                შემოსავალი
                              </span>
                              <span className="font-mono-num font-bold text-zinc-900 dark:text-white">
                                {formatPrice(evRevenue)}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTicketsEventId(null);
                      setTicketSearch("");
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-white transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>ღონისძიებების სიაში დაბრუნება</span>
                  </button>

                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                    <div>
                      {selectedTicketsEvent.organizerName && (
                        <span className="text-xs font-semibold text-zinc-400 block">
                          {selectedTicketsEvent.organizerName}
                        </span>
                      )}
                      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        {selectedTicketsEvent.title}
                      </h1>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {selectedTicketsEvent.date}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {selectedTicketsEvent.location}
                        </span>
                      </p>
                    </div>

                    <div className="text-xs font-mono-num text-zinc-500 dark:text-zinc-400">
                      სულ გაყიდული:{" "}
                      <strong className="text-zinc-900 dark:text-white">
                        {eventSpecificTickets.length}
                      </strong>{" "}
                      • შემოსული:{" "}
                      <strong className="text-zinc-900 dark:text-white">
                        {eventSpecificTickets.filter((t) => t.used).length}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={ticketSearch}
                    onChange={(e) => setTicketSearch(e.target.value)}
                    placeholder="მოძებნე ბილეთი სახელით, გვარით, ტელეფონით, ელ-ფოსტით, ID-ით ან კატეგორიით..."
                    className="w-full pl-10 pr-9 py-2.5 rounded-xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 dark:focus:border-white transition"
                  />
                  {ticketSearch && (
                    <button
                      type="button"
                      onClick={() => setTicketSearch("")}
                      className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm overflow-x-auto">
                  {filteredEventTickets.length === 0 ? (
                    <div className="p-12 text-center space-y-2">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {normalizedTicketQuery
                          ? `„${ticketSearch}“ — ბილეთი ვერ მოიძებნა`
                          : "ამ ღონისძიებაზე ბილეთები ჯერ არ გაყიდულა"}
                      </p>
                      {normalizedTicketQuery && (
                        <button
                          type="button"
                          onClick={() => setTicketSearch("")}
                          className="text-xs font-semibold text-zinc-900 dark:text-white underline cursor-pointer"
                        >
                          ძიების გასუფთავება
                        </button>
                      )}
                    </div>
                  ) : (
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 uppercase tracking-wider text-[11px]">
                          <th className="py-3.5 px-5">მფლობელი & კონტაქტი</th>
                          <th className="py-3.5 px-5">კატეგორია</th>
                          <th className="py-3.5 px-5">ბილეთის ID</th>
                          <th className="py-3.5 px-5">შეძენის დრო</th>
                          <th className="py-3.5 px-5">გადახდა & თანხა</th>
                          <th className="py-3.5 px-5">სტატუსი</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {filteredEventTickets.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                          >
                            <td className="py-3.5 px-5">
                              <div className="font-bold text-zinc-900 dark:text-white">
                                {t.ownerName}
                              </div>
                              <div className="text-[11px] text-zinc-500 font-mono-num">
                                {t.ownerPhone}
                              </div>
                              {t.ownerEmail && (
                                <div className="text-[11px] text-zinc-400">
                                  {t.ownerEmail}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-5">
                              <Badge variant="warning">
                                {t.tierName || "Standard"}
                              </Badge>
                            </td>

                            <td className="py-3.5 px-5 font-mono-num font-bold text-zinc-900 dark:text-white">
                              {t.baseCode}
                            </td>

                            <td className="py-3.5 px-5 font-mono-num text-zinc-600 dark:text-zinc-300">
                              <div>{t.purchasedAt || "—"}</div>
                              {t.createdAt && (
                                <div className="text-[10px] text-zinc-400">
                                  {new Date(t.createdAt).toLocaleDateString(
                                    "ka-GE"
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="py-3.5 px-5 font-mono-num">
                              <div className="font-bold text-zinc-900 dark:text-white">
                                {t.paidPrice === 0
                                  ? "0.00 ₾"
                                  : formatPrice(t.paidPrice)}
                              </div>
                              <div className="text-[10px] text-zinc-400 inline-flex items-center gap-1 uppercase">
                                <CreditCard className="w-3 h-3" />
                                <span>{t.paymentMethod || "card"}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-5">
                              {t.used ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  შემოსული ({t.scannedAt})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  მოლოდინში
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
