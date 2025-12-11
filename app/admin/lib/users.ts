// app/admin/lib/users.ts
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export type UserSummary = {
  id: string;
  email: string;
  name: string;
  createdAtText?: string;
};

export async function fetchUsers(): Promise<UserSummary[]> {
  const snap = await getDocs(collection(db, "users"));

  const userList: UserSummary[] = snap.docs
    .map((d) => {
      const data = d.data() as any;
      const raw = data.createdAt;

      let createdAtText: string | undefined;
      if (raw && typeof raw.toDate === "function") {
        createdAtText = raw.toDate().toLocaleString("ja-JP");
      }

      return {
        id: d.id,
        email: data.email ?? "",
        name: data.name ?? "",
        createdAtText,
      };
    })
    .sort((a, b) =>
      (a.name || a.email).localeCompare(b.name || b.email, "ja")
    );

  return userList;
}
