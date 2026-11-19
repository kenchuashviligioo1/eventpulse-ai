import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDW221dyQhuk5klY3UU-1GGh6R2Rw33in8",
  authDomain: "eventpulse-ai-d284e.firebaseapp.com",
  projectId: "eventpulse-ai-d284e",
  storageBucket: "eventpulse-ai-d284e.firebasestorage.app",
  messagingSenderId: "7938586380",
  appId: "1:7938586380:web:d519d643ffbfded7a0fb29",
  measurementId: "G-MXYH7Y6RZV",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
