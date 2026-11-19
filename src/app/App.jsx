import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./MainLayout";
import { EventsPage } from "../features/events/EventsPage";
import { MyTicketsPage } from "../features/ticket-pass/MyTicketsPage";

const Placeholder = ({ title }) => (
  <div className="p-8 rounded-2xl border-[1.5px] border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-center">
    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
      {title}
    </h1>
    <p className="text-zinc-500 dark:text-zinc-400 mt-2">
      მზადდება მომდევნო ეტაპზე...
    </p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<EventsPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route
            path="/sponsor"
            element={<Placeholder title="სპონსორის ROI Dashboard" />}
          />
          <Route
            path="/scanner"
            element={<Placeholder title="ორგანიზატორის QR სკანერი" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
