import { NavLink } from "react-router-dom";

export function Navbar() {
  const navItems = [
    { to: "/", label: "ღონისძიებები" },
    { to: "/my-tickets", label: "ჩემი ბილეთები" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/8 bg-[#0A0A0A]/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span className="font-semibold text-base tracking-tight text-white">
            EventPulse
          </span>
        </NavLink>

        <nav className="flex items-center gap-6">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive
                    ? "text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
