import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import {
  Ticket,
  Sun,
  Moon,
  Search,
  X,
  QrCode,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { useEventStore } from "../../store/useEventStore";

const USER_STORAGE_KEY = "eventpulse_public_user";

export function Navbar() {
  const theme = useEventStore((state) => state.theme);
  const toggleTheme = useEventStore((state) => state.toggleTheme);
  const tickets = useEventStore((state) => state.tickets);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const syncUser = () => {
      try {
        const saved = localStorage.getItem(USER_STORAGE_KEY);
        setCurrentUser(saved ? JSON.parse(saved) : null);
      } catch {
        setCurrentUser(null);
      }
    };
    window.addEventListener("ep-user-updated", syncUser);
    return () => window.removeEventListener("ep-user-updated", syncUser);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const activeTicketsCount = tickets.filter((t) => !t.used).length;

  const handleSearchChange = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set("q", value);
    } else {
      next.delete("q");
    }
    const searchString = next.toString();
    navigate(
      { pathname: "/", search: searchString ? `?${searchString}` : "" },
      { replace: true },
    );
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "EP";

  return (
    <header className="sticky top-0 z-40 bg-[#14161F] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* ლოგო */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            src="/EventPulse-logo.png"
            alt="EventPulse"
            className="h-9 sm:h-10 w-auto object-contain"
          />
        </Link>

        {/* საძიებო ველი */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="ძებნა"
              className="w-full h-10 pl-10 pr-9 rounded-lg bg-white/10 hover:bg-white/12 focus:bg-white text-white focus:text-zinc-900 placeholder:text-zinc-400 focus:placeholder:text-zinc-500 text-xs sm:text-sm transition outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                aria-label="ძიების გასუფთავება"
                className="p-1 text-zinc-400 hover:text-zinc-700 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* მარჯვენა ნავიგაცია */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <NavLink
            to="/my-tickets"
            className={({ isActive }) =>
              `px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-zinc-300 hover:text-white hover:bg-white/10"
              }`
            }
          >
            <Ticket className="w-4 h-4 text-indigo-400" />
            <span className="hidden md:inline">ჩემი ბილეთები</span>
            {activeTicketsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono-num text-[10px] font-bold leading-none">
                {activeTicketsCount}
              </span>
            )}
          </NavLink>

          {currentUser ? (
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `pl-1.5 pr-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "bg-white/10 hover:bg-white/15 text-white"
                }`
              }
            >
              <span className="w-6 h-6 rounded bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {initials}
              </span>
              <span className="max-w-24 truncate hidden sm:inline">
                {currentUser.name.split(" ")[0]}
              </span>
            </NavLink>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>შესვლა</span>
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label="თემის შეცვლა"
            className="w-9 h-9 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function CategoryStrip() {
  const events = useEventStore((state) => state.events);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get("cat") || "ALL";

  const categories = Array.from(
    new Set(events.map((e) => e.category).filter(Boolean)),
  );

  const handleCategoryClick = (cat) => {
    const next = new URLSearchParams(searchParams);
    if (cat === "ALL") {
      next.delete("cat");
    } else {
      next.set("cat", cat);
    }
    const searchString = next.toString();
    navigate(
      { pathname: "/", search: searchString ? `?${searchString}` : "" },
      { replace: true },
    );
  };

  return (
    <nav className="bg-white dark:bg-[#11131B] border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => handleCategoryClick("ALL")}
            className={`py-3.5 text-xs sm:text-[13px] font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
              activeCategory === "ALL"
                ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            ყველა ღონისძიება
          </button>

          {categories.map((cat) => {
            const isSelected = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`py-3.5 text-xs sm:text-[13px] font-semibold whitespace-nowrap border-b-2 transition cursor-pointer ${
                  isSelected
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export function PublicLayout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F9] dark:bg-[#0D0E13] text-zinc-900 dark:text-zinc-100">
      <Navbar />
      {pathname === "/" && <CategoryStrip />}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="bg-[#14161F] text-zinc-400 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          <div className="space-y-2.5">
            <Link to="/" className="inline-flex items-center">
              <img
                src="/EventPulse-logo.png"
                alt="EventPulse"
                className="h-9 w-auto object-contain"
              />
            </Link>
            <p className="leading-relaxed">
              ღონისძიებების ბილეთების ონლაინ პლატფორმა.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              მხარდაჭერა
            </h4>
            <ul className="space-y-1.5">
              <li>support@eventpulse.ge</li>
              <li>ხშირად დასმული კითხვები</li>
              <li>წესები და პირობები</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              ნავიგაცია
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/" className="hover:text-white transition">
                  ყველა ღონისძიება
                </Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-white transition">
                  ჩემი ბილეთები
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-white transition">
                  ჩემი პროფილი
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              პერსონალისთვის
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/scanner"
                  className="hover:text-white transition inline-flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>კარის სკანერი</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/admin"
                  className="hover:text-white transition inline-flex items-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>ორგანიზატორის პანელი</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-4 text-center text-[11px] text-zinc-500">
          © 2026 EventPulse. ყველა უფლება დაცულია.
        </div>
      </footer>
    </div>
  );
}
