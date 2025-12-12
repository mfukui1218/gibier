// app/admin/stock/useParts.ts
"use client";

import { useEffect, useState } from "react";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export type Part = {
  id: string;
  name: string;
  animal: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
};

export type NewPartInput = {
  id: string;
  name: string;
  animal: string;
  description: string;
  price: string;
  stock: string;
  imageFile?: File | null;
};

export function useParts() {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);
    if (text) setTimeout(() => setMessage(""), 3000);
  };

  const loadParts = async () => {
    setLoading(true);
    try {
      const colRef = collection(db, "parts");
      const snap = await getDocs(colRef);

      const nextParts: Part[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name ?? "",
          animal: data.animal ?? "",
          description: data.description ?? "",
          price:
            data.price === undefined || data.price === null
              ? ""
              : String(data.price),
          stock:
            data.stock === undefined || data.stock === null
              ? ""
              : String(data.stock),
          imageUrl: data.imageUrl ?? "",
        };
      });

      nextParts.sort((a, b) =>
        `${a.animal}${a.name}`.localeCompare(`${b.animal}${b.name}`, "ja")
      );

      setParts(nextParts);
    } catch (e) {
      console.error(e);
      showMessage("在庫情報の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  const updatePartField = (id: string, field: keyof Part, value: string) => {
    setParts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const savePart = async (part: Part) => {
    try {
      await setDoc(
        doc(db, "parts", part.id),
        {
          name: part.name || null,
          animal: part.animal || null,
          description: part.description || null,
          price: part.price ? Number(part.price) : null,
          stock: part.stock ? Number(part.stock) : null,
          imageUrl: part.imageUrl || null,
        },
        { merge: true }
      );
      showMessage("保存しました");
    } catch (e) {
      console.error(e);
      showMessage("保存に失敗しました");
      throw e;
    }
  };

  const deletePart = async (id: string) => {
    try {
      await deleteDoc(doc(db, "parts", id));
      setParts((prev) => prev.filter((p) => p.id !== id));
      showMessage("削除しました");
    } catch (e) {
      console.error(e);
      showMessage("削除に失敗しました");
      throw e;
    }
  };

  // 既存部位の画像アップロード（UUID名 + snapshot.refでURL取得）
  const uploadPartImage = async (partId: string, file: File) => {
    try {
      showMessage("画像アップロード中...");

      if (!file.type.startsWith("image/")) {
        showMessage("画像ファイルのみアップロードできます");
        throw new Error("not-image");
      }

      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const objectPath = `parts/${partId}/${fileName}`;

      const storageRef = ref(storage, objectPath);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      await setDoc(doc(db, "parts", partId), { imageUrl: url }, { merge: true });

      setParts((prev) =>
        prev.map((p) => (p.id === partId ? { ...p, imageUrl: url } : p))
      );

      showMessage("画像を更新しました");
      return url;
    } catch (e) {
      console.error(e);
      showMessage("画像アップロードに失敗しました");
      throw e;
    }
  };

  // 新しい部位追加（画像あればアップロード）
const addPart = async (input: NewPartInput) => {
  const trimmedId = input.id.trim();
  const trimmedName = input.name.trim();

  if (!trimmedId || !trimmedName) {
    showMessage("部位IDと部位名は必須です");
    throw new Error("validation");
  }

  if (parts.some((p) => p.id === trimmedId)) {
    showMessage("同じIDの部位が既に存在します");
    throw new Error("duplicate-id");
  }

  try {
    // ① Firestore 用 ID（元のままでOK）
    await setDoc(doc(db, "parts", trimmedId), {
      name: trimmedName || null,
      animal: input.animal || null,
      description: input.description || null,
      price: input.price ? Number(input.price) : null,
      stock: input.stock ? Number(input.stock) : null,
      imageUrl: null,
    });

    let imageUrl = "";

    // ② Storage 用 ID（安全化）
    if (input.imageFile) {
      const safePartId = trimmedId.replace(/[^\w\-]/g, "_");

      const ext = input.imageFile.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const objectPath = `parts/${safePartId}/${fileName}`;

      const storageRef = ref(storage, objectPath);
      const snapshot = await uploadBytes(storageRef, input.imageFile);
      imageUrl = await getDownloadURL(snapshot.ref);

      // Firestore に URL 保存
      await setDoc(
        doc(db, "parts", trimmedId),
        { imageUrl },
        { merge: true }
      );
    }

    const saved: Part = {
      id: trimmedId,
      name: trimmedName,
      animal: input.animal,
      description: input.description,
      price: input.price,
      stock: input.stock,
      imageUrl,
    };

    setParts((prev) => [...prev, saved]);
    showMessage("保存しました");
  } catch (e) {
    console.error(e);
    showMessage("新しい部位の追加に失敗しました");
    throw e;
  }
};


  return {
    parts,
    loading,
    message,
    updatePartField,
    savePart,
    deletePart,
    uploadPartImage,
    addPart,
  };
}
