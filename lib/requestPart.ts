// lib/requestPart.ts
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function requestPart(partId: string, amount: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("ログインが必要です");

  await addDoc(collection(db, "requests"), {
    partId,
    amount,                 // ★ 希望量を保存
    userId: user.uid,
    createdAt: serverTimestamp(),
    status: "pending",
  });
}
