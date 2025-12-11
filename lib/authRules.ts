// app/lib/authRules.ts
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function isEmailAllowed(rawEmail: string): Promise<boolean> {
  const normalized = rawEmail.trim().toLowerCase();
  if (!normalized) return false;

  const ref = doc(db, "allowedEmails", normalized);
  const snap = await getDoc(ref);
  return snap.exists();
}
