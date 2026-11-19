import { NavLink } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useEventStore } from "../../store/useEventStore";

export function Navbar() {
  const theme = useEventStore((state) => state.theme);
  const toggleTheme = useEventStore((state) => state.toggleTheme);

  const navItems = [
    { to: "/", label: "ღონისძიებები" },
    { to: "/my-tickets", label: "ჩემი ბილეთები" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0B0B0C]/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white transition-colors" />
          <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-white">
            EventPulse
          </span>
        </NavLink>

        <div className="flex items-center gap-6">
          <nav className="flex items-center gap-6">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `text-sm transition-colors ${
                    isActive
                      ? "text-zinc-900 dark:text-white font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* თემის გადამრთველი */}
          <button
            onClick={toggleTheme}
            aria-label="თემის შეცვლა"
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer"
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
