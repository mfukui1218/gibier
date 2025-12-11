// app/admin/lib/allowRequests.ts
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

export type AllowRequest = {
  id: string;
  email: string;
  createdAtText?: string;
};

export async function fetchAllowRequests(): Promise<AllowRequest[]> {
  const snap = await getDocs(collection(db, "allowRequests")); // ← Cloud Functions 側とコレクション名合わせる
  const list: AllowRequest[] = snap.docs
    .map((d) => {
      const data = d.data() as any;
      const raw = data.createdAt;

      return {
        id: d.id,
        email: data.email ?? "",
        createdAtText:
          raw && typeof raw.toDate === "function"
            ? raw.toDate().toLocaleString("ja-JP")
            : undefined,
      };
    })
    .sort((a, b) => a.email.localeCompare(b.email));

  return list;
}

export async function deleteAllowRequest(id: string): Promise<void> {
  await deleteDoc(doc(db, "allowRequests", id));
}
