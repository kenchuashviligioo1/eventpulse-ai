import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../shared/lib/firebase";

const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Tbilisi Tech & Electronic Night 2026",
    category: "ფესტივალი / მუსიკა",
    date: "28 ნოემბერი, 2026 • 22:00",
    location: "Expo Georgia, პავილიონი 11",
    basePrice: 50,
    totalTickets: 500,
    soldTickets: 412,
    demandLevel: 82,
    activeUsers: 148,
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    sponsors: ["TBC Concept", "CityPay.io", "Red Bull Georgia"],
  },
  {
    id: "evt-2",
    title: "AI & Future Startups Summit",
    category: "კონფერენცია",
    date: "5 დეკემბერი, 2026 • 11:00",
    location: "Radisson Blu Iveria, თბილისი",
    basePrice: 80,
    totalTickets: 300,
    soldTickets: 85,
    demandLevel: 24,
    activeUsers: 19,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
    sponsors: ["Bank of Georgia", "GITA", "CityPay.io"],
  },
  {
    id: "evt-3",
    title: "Cyberpunk Visual Arts & Mapping Show",
    category: "აუდიო-ვიზუალური შოუ",
    date: "12 დეკემბერი, 2026 • 20:00",
    location: "Fabrika Tbilisi, საკონფერენციო სივრცე",
    basePrice: 40,
    totalTickets: 250,
    soldTickets: 140,
    demandLevel: 55,
    activeUsers: 64,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    sponsors: ["TBC", "Bolt", "Borjomi"],
  },
];

export const useEventStore = create(
  persist(
    (set) => ({
      theme: "light",
      events: INITIAL_EVENTS,
      selectedEventId: null,
      tickets: [],
      myTicketIds: [],
      isScannerAuth: false,
      sponsorScans: [
        {
          id: 1,
          sponsor: "CityPay.io",
          action: "უფასო ყავა / მერჩი",
          time: "21:15",
          guest: "გიორგი კ.",
        },
        {
          id: 2,
          sponsor: "TBC Concept",
          action: "VIP Lounge წვდომა",
          time: "21:40",
          guest: "ნინო მ.",
        },
        {
          id: 3,
          sponsor: "Red Bull Georgia",
          action: "ენერგეტიკული სასმელი",
          time: "22:05",
          guest: "ლუკა ბ.",
        },
      ],

      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),

      updateEventDemand: (eventId, newDemand) =>
        set((state) => ({
          events: state.events.map((ev) =>
            ev.id === eventId
              ? {
                  ...ev,
                  demandLevel: newDemand,
                  activeUsers: Math.max(10, Math.round(newDemand * 1.8)),
                }
              : ev
          ),
        })),

      openCheckout: (eventId) => set({ selectedEventId: eventId }),
      closeCheckout: () => set({ selectedEventId: null }),

      // Firestore Real-time Listener
      subscribeToTickets: () => {
        const q = query(
          collection(db, "tickets"),
          orderBy("createdAt", "desc")
        );
        return onSnapshot(
          q,
          (snapshot) => {
            const liveTickets = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));
            set({ tickets: liveTickets });
          },
          (error) => {
            console.error("Firestore snapshot error:", error);
          }
        );
      },

      // ბილეთის შენახვა Firebase Firestore-ში + მომენტალური გამოჩენა UI-ში
      addTicket: async (ticketData) => {
        const newPayload = {
          ...ticketData,
          createdAt: Date.now(),
        };

        const docRef = await addDoc(collection(db, "tickets"), newPayload);
        const savedTicket = { id: docRef.id, ...newPayload };

        set((state) => {
          const alreadyExists = state.tickets.some((t) => t.id === docRef.id);
          return {
            myTicketIds: [docRef.id, ...state.myTicketIds],
            tickets: alreadyExists
              ? state.tickets
              : [savedTicket, ...state.tickets],
            events: state.events.map((ev) =>
              ev.id === ticketData.eventId
                ? {
                    ...ev,
                    soldTickets: Math.min(ev.totalTickets, ev.soldTickets + 1),
                  }
                : ev
            ),
          };
        });
      },

      // ბილეთის გამოყენებულად მონიშვნა Firestore-ში
      markTicketUsed: async (ticketDocId) => {
        const ticketRef = doc(db, "tickets", ticketDocId);
        await updateDoc(ticketRef, {
          used: true,
          scannedAt: new Date().toLocaleTimeString("ka-GE", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      },

      loginScanner: () => set({ isScannerAuth: true }),
      logoutScanner: () => set({ isScannerAuth: false }),

      addSponsorScan: (scan) =>
        set((state) => ({
          sponsorScans: [scan, ...state.sponsorScans],
        })),
    }),
    {
      name: "eventpulse-storage",
      partialize: (state) => ({
        theme: state.theme,
        events: state.events,
        myTicketIds: state.myTicketIds,
        isScannerAuth: state.isScannerAuth,
        sponsorScans: state.sponsorScans,
      }),
    }
  )
);
