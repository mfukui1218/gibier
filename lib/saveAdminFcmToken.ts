import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function saveAdminFcmToken(uid: string, token: string) {
  if (!uid || !token) return;

  await setDoc(
    doc(db, "adminTokens", uid),
    {
      token,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
