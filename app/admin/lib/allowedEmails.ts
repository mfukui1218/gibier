// app/admin/lib/allowedEmails.ts
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

export type AllowedEmail = {
  email: string;
  createdAtText?: string;
};

export async function fetchAllowedEmails(): Promise<AllowedEmail[]> {
  const snap = await getDocs(collection(db, "allowedEmails"));
  const list: AllowedEmail[] = snap.docs
    .map((d) => {
      const data = d.data() as any;
      const raw = data.createdAt;

      return {
        email: d.id,
        createdAtText:
          raw && typeof raw.toDate === "function"
            ? raw.toDate().toLocaleString("ja-JP")
            : undefined,
      };
    })
    .sort((a, b) => a.email.localeCompare(b.email));

  return list;
}

export async function addAllowedEmail(rawEmail: string): Promise<AllowedEmail> {
  const normalized = rawEmail.trim().toLowerCase();
  const now = new Date();

  await setDoc(doc(db, "allowedEmails", normalized), {
    createdAt: now,
  });

  return {
    email: normalized,
    createdAtText: now.toLocaleString("ja-JP"),
  };
}

export async function removeAllowedEmail(rawEmail: string): Promise<void> {
  const normalized = rawEmail.trim().toLowerCase();
  await deleteDoc(doc(db, "allowedEmails", normalized));
}
