import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PublicLayout } from "../shared/components/PublicLayout";
import { EventsPage } from "../features/events/EventsPage";
import { EventDetailsPage } from "../features/events/EventDetailsPage";
import { MyTicketsPage } from "../features/ticket-pass/MyTicketsPage";
import { ProfilePage } from "../features/profile/ProfilePage";
import { LoginPage } from "../features/auth/LoginPage";
import { ScannerPage } from "../features/scanner/ScannerPage";
import { AdminPage } from "../features/admin/AdminPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* სრულეკრანიანი გვერდი ჰედერისა და ფუტერის გარეშე */}
        <Route path="/login" element={<LoginPage />} />

        {/* საჯარო გვერდები საერთო ჰედერითა და ფუტერით */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailsPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* შიდა სამუშაო გვერდები */}
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
