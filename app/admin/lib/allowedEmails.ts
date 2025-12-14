// app/admin/lib/allowedEmails.ts
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";

export type AllowedEmail = {
  id: string;            // docId（今は email をそのままIDにしてOK）
  email: string;         // 表示用メール
  createdAtText?: string;
};

export async function fetchAllowedEmails(): Promise<AllowedEmail[]> {
  const snap = await getDocs(collection(db, "allowedEmails"));

  return snap.docs
    .map((d) => {
      const data = d.data() as any;
      const email = (data.email ?? d.id) as string;

      return {
        id: d.id,
        email,
        createdAtText: data.createdAt?.toDate?.()?.toLocaleString("ja-JP"),
      };
    })
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function addAllowedEmail(rawEmail: string): Promise<AllowedEmail> {
  const email = rawEmail.trim().toLowerCase();
  const now = new Date();

  // ✅ docId も email に統一（まずはこれで安定させる）
  const id = email;

  await setDoc(doc(db, "allowedEmails", id), {
    email,
    createdAt: now,
  });

  return {
    id,
    email,
    createdAtText: now.toLocaleString("ja-JP"),
  };
}

export async function removeAllowedEmail(emailOrId: string): Promise<void> {
  const id = emailOrId.trim().toLowerCase();
  await deleteDoc(doc(db, "allowedEmails", id));
}
