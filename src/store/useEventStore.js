import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  increment,
} from "firebase/firestore";
import { db } from "../shared/lib/firebase";

const INITIAL_EVENTS = [
  {
    id: "evt-1",
    title: "Tbilisi Tech & Electronic Night 2026",
    category: "ფესტივალი / მუსიკა",
    date: "28 ნოემბერი, 2026 • 22:00",
    location: "Expo Georgia, პავილიონი 11",
    description:
      "ელექტრონული მუსიკისა და ვიზუალური ხელოვნების ღამე Expo Georgia-ს მე-11 პავილიონში.",
    basePrice: 50,
    totalTickets: 500,
    soldTickets: 412,
    demandLevel: 82,
    activeUsers: 148,
    image:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
    sponsors: ["TBC Concept", "CityPay.io", "Red Bull Georgia"],
    ticketTiers: [
      { id: "tier-1", name: "Standard", price: 50, quantity: 400 },
      { id: "tier-2", name: "VIP Lounge", price: 120, quantity: 80 },
      { id: "tier-3", name: "Backstage", price: 250, quantity: 20 },
    ],
  },
  {
    id: "evt-2",
    title: "AI & Future Startups Summit",
    category: "კონფერენცია",
    date: "5 დეკემბერი, 2026 • 11:00",
    location: "Radisson Blu Iveria, თბილისი",
    description:
      "ტექნოლოგიური სტარტაპების, ინვესტორებისა და ხელოვნური ინტელექტის ყოველწლიური სამიტი.",
    basePrice: 80,
    totalTickets: 300,
    soldTickets: 85,
    demandLevel: 24,
    activeUsers: 19,
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
    sponsors: ["Bank of Georgia", "GITA", "CityPay.io"],
    ticketTiers: [
      { id: "tier-21", name: "Attendee", price: 80, quantity: 200 },
      { id: "tier-22", name: "Investor", price: 300, quantity: 50 },
      { id: "tier-23", name: "Speaker", price: 0, quantity: 30 },
      { id: "tier-24", name: "VIP", price: 180, quantity: 20 },
    ],
  },
  {
    id: "evt-3",
    title: "Cyberpunk Visual Arts & Mapping Show",
    category: "აუდიო-ვიზუალური შოუ",
    date: "12 დეკემბერი, 2026 • 20:00",
    location: "Fabrika Tbilisi, საკონფერენციო სივრცე",
    description:
      "3D პროექციული მეფინგი და აუდიო-ვიზუალური ინსტალაციები Fabrika-ს სივრცეში.",
    basePrice: 40,
    totalTickets: 250,
    soldTickets: 140,
    demandLevel: 55,
    activeUsers: 64,
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
    sponsors: ["TBC", "Bolt", "Borjomi"],
    ticketTiers: [
      { id: "tier-31", name: "Standard", price: 40, quantity: 200 },
      { id: "tier-32", name: "VIP", price: 90, quantity: 50 },
    ],
  },
];

export const useEventStore = create(
  persist(
    (set, get) => ({
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

      // რეალურ დროში ღონისძიებების წამოღება Firebase-იდან
      subscribeToEvents: () => {
        const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
        return onSnapshot(
          q,
          (snapshot) => {
            if (snapshot.empty) return;
            const liveEvents = snapshot.docs.map((docSnap) => ({
              id: docSnap.id,
              ...docSnap.data(),
            }));
            set({ events: liveEvents });
          },
          (error) => {
            console.error("Firestore events snapshot error:", error);
          },
        );
      },

      // ახალი ივენთის შენახვა Firebase-ში
      addEvent: async (newEvent) => {
        const eventPayload = {
          soldTickets: 0,
          demandLevel: 45,
          activeUsers: 32,
          sponsors: ["TBC Concept", "CityPay.io"],
          ...newEvent,
          createdAt: Date.now(),
        };

        try {
          const docRef = await addDoc(collection(db, "events"), eventPayload);
          const savedEvent = { id: docRef.id, ...eventPayload };

          set((state) => {
            const exists = state.events.some((e) => e.id === docRef.id);
            return {
              events: exists ? state.events : [savedEvent, ...state.events],
            };
          });
        } catch (error) {
          console.error("Failed to save event to Firebase:", error);
          throw error;
        }
      },

      // არსებული ივენთის რედაქტირება Firebase-ში
      updateEvent: async (eventId, updatedFields) => {
        set((state) => ({
          events: state.events.map((ev) =>
            ev.id === eventId ? { ...ev, ...updatedFields } : ev,
          ),
        }));

        if (!String(eventId).startsWith("evt-")) {
          try {
            const eventRef = doc(db, "events", eventId);
            await updateDoc(eventRef, updatedFields);
          } catch (error) {
            console.error("Failed to update event in Firebase:", error);
          }
        }
      },

      // ივენთის წაშლა Firebase-იდან
      deleteEvent: async (eventId) => {
        set((state) => ({
          events: state.events.filter((ev) => ev.id !== eventId),
        }));

        if (!String(eventId).startsWith("evt-")) {
          try {
            await deleteDoc(doc(db, "events", eventId));
          } catch (error) {
            console.error("Failed to delete event from Firebase:", error);
          }
        }
      },

      // მოთხოვნის დონის შეცვლა Firebase-ში
      updateEventDemand: async (eventId, newDemand) => {
        const nextActiveUsers = Math.max(10, Math.round(newDemand * 1.8));
        set((state) => ({
          events: state.events.map((ev) =>
            ev.id === eventId
              ? {
                  ...ev,
                  demandLevel: newDemand,
                  activeUsers: nextActiveUsers,
                }
              : ev,
          ),
        }));

        if (!String(eventId).startsWith("evt-")) {
          try {
            await updateDoc(doc(db, "events", eventId), {
              demandLevel: newDemand,
              activeUsers: nextActiveUsers,
            });
          } catch (error) {
            console.error("Failed to update demand in Firebase:", error);
          }
        }
      },

      openCheckout: (eventOrId) =>
        set({
          selectedEventId:
            typeof eventOrId === "object" && eventOrId !== null
              ? eventOrId.id
              : eventOrId,
        }),
      closeCheckout: () => set({ selectedEventId: null }),

      subscribeToTickets: () => {
        const q = query(
          collection(db, "tickets"),
          orderBy("createdAt", "desc"),
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
            console.error("Firestore tickets snapshot error:", error);
          },
        );
      },

      addTicket: async (ticketData) => {
        const newPayload = {
          ...ticketData,
          createdAt: Date.now(),
        };

        const docRef = await addDoc(collection(db, "tickets"), newPayload);
        const savedTicket = { id: docRef.id, ...newPayload };

        const targetEvent = get().events.find(
          (e) => e.id === ticketData.eventId,
        );

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
                : ev,
            ),
          };
        });

        // გაყიდული ბილეთების რაოდენობის განახლება Firebase-შიც
        if (targetEvent && !String(targetEvent.id).startsWith("evt-")) {
          try {
            await updateDoc(doc(db, "events", targetEvent.id), {
              soldTickets: increment(1),
            });
          } catch (err) {
            console.error("Failed to increment soldTickets in Firebase:", err);
          }
        }
      },

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
        myTicketIds: state.myTicketIds,
        isScannerAuth: state.isScannerAuth,
        sponsorScans: state.sponsorScans,
      }),
    },
  ),
);
