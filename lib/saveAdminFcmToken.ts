// lib/saveAdminFcmToken.ts
"use client";

import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

export async function saveAdminFcmToken(params: {
  uid: string;
  email: string;
  token: string;
}) {
  const { uid, email, token } = params;

  // ✅ 非adminは絶対に adminTokens に触らない
  if ((email ?? "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return;

  // token を docId にする（同一端末は上書き）
  await setDoc(doc(db, "adminTokens", token), {
    token,
    uid,
    email,
    updatedAt: serverTimestamp(),
  });
}
