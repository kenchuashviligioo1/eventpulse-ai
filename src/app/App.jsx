import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "../shared/components/PublicLayout";
import { EventsPage } from "../features/events/EventsPage";
import { EventDetailsPage } from "../features/events/EventDetailsPage";
import { MyTicketsPage } from "../features/ticket-pass/MyTicketsPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { LoginPage } from "../features/auth/LoginPage";
import { ScannerPage } from "../features/scanner/ScannerPage";
import { AdminPage } from "../features/admin/AdminPage";
import { useEventStore } from "../store/useEventStore";

export function App() {
  const subscribeToEvents = useEventStore((state) => state.subscribeToEvents);
  const subscribeToTickets = useEventStore((state) => state.subscribeToTickets);

  useEffect(() => {
    const unsubEvents = subscribeToEvents();
    const unsubTickets = subscribeToTickets();
    return () => {
      if (typeof unsubEvents === "function") unsubEvents();
      if (typeof unsubTickets === "function") unsubTickets();
    };
  }, [subscribeToEvents, subscribeToTickets]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<PublicLayout />}>
          <Route path="/" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
