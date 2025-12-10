// lib/updatePart.ts
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function updatePart(id: string, data: { price?: string; stock?: number }) {
  await setDoc(doc(db, "parts", id), data, { merge: true });
}
