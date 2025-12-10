// lib/getPart.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getPart(id: string) {
  const snap = await getDoc(doc(db, "parts", id));
  return snap.exists() ? snap.data() : null;
}
