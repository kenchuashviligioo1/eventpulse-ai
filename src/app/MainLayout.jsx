import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../shared/components/Navbar";
import { CheckoutModal } from "../features/checkout/CheckoutModal";
import { useEventStore } from "../store/useEventStore";

export function MainLayout() {
  const theme = useEventStore((state) => state.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] text-zinc-900 dark:bg-[#0B0B0C] dark:text-zinc-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <Outlet />
      </main>
      <CheckoutModal />
    </div>
  );
}
