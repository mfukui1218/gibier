import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

// uploadImage.ts
export async function uploadHarvestImage(file: File) {
  const path = `harvests/${crypto.randomUUID()}.jpg`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { url, path };
}
