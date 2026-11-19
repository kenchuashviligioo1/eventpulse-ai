import { Outlet } from "react-router-dom";
import { Navbar } from "../shared/components/Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0A] text-zinc-100">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
