import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./MainLayout";
import { EventsPage } from "../features/events/EventsPage";

const Placeholder = ({ title }) => (
  <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 text-center">
    <h1 className="text-2xl font-bold text-white">{title}</h1>
    <p className="text-zinc-400 mt-2">მზადდება მომდევნო ეტაპზე...</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<EventsPage />} />
          <Route
            path="/my-tickets"
            element={<Placeholder title="ჩემი დინამიკური QR საშვი" />}
          />
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
