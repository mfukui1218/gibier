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
  updateDoc,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export type Part = {
  id: string;
  name: string;
  animal: string;
  description: string;
  price: string;
  stock: string;
  imageUrl: string;
  imagePath?: string; // ✅ 追加（Storageのパス）
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
      const snap = await getDocs(collection(db, "parts"));

      const nextParts: Part[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name ?? "",
          animal: data.animal ?? "",
          description: data.description ?? "",
          price: data.price == null ? "" : String(data.price),
          stock: data.stock == null ? "" : String(data.stock),
          imageUrl: data.imageUrl ?? "",
          imagePath: data.imagePath ?? undefined, // ✅ 読む
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
    setParts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
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
          imagePath: part.imagePath || null, // ✅ これも保存
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

  // ✅ 画像アップロード（imageUrl + imagePath を保存）
  const uploadPartImage = async (partId: string, file: File) => {
    try {
      showMessage("画像アップロード中...");

      if (!file.type.startsWith("image/")) {
        showMessage("画像ファイルのみアップロードできます");
        throw new Error("not-image");
      }

      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;

      // Storage パス（Firestoreのidが安全じゃない可能性があるので一応安全化）
      const safePartId = partId.replace(/[^\w\-]/g, "_");
      const objectPath = `parts/${safePartId}/${fileName}`;

      const sref = storageRef(storage, objectPath);
      const snapshot = await uploadBytes(sref, file);
      const url = await getDownloadURL(snapshot.ref);

      // ✅ Firestore に両方保存
      await setDoc(
        doc(db, "parts", partId),
        { imageUrl: url, imagePath: objectPath },
        { merge: true }
      );

      // ✅ 画面にも反映
      setParts((prev) =>
        prev.map((p) =>
          p.id === partId ? { ...p, imageUrl: url, imagePath: objectPath } : p
        )
      );

      showMessage("画像を更新しました");
      return url;
    } catch (e) {
      console.error(e);
      showMessage("画像アップロードに失敗しました");
      throw e;
    }
  };

  // ✅ 画像だけ削除（部位は残す）
  const deletePartImage = async (partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return;

    try {
      // Storage削除（pathがあるときだけ）
      if (part.imagePath) {
        await deleteObject(storageRef(storage, part.imagePath));
      }

      // Firestore: imageUrl / imagePath を消す
      await updateDoc(doc(db, "parts", partId), {
        imageUrl: null,
        imagePath: null,
      });

      // 画面反映
      setParts((prev) =>
        prev.map((p) =>
          p.id === partId ? { ...p, imageUrl: "", imagePath: undefined } : p
        )
      );

      showMessage("画像を削除しました");
    } catch (e) {
      console.error(e);
      showMessage("画像の削除に失敗しました");
      throw e;
    }
  };

  // ✅ 部位を削除（画像も一緒に削除）
  const deletePart = async (partId: string) => {
    const part = parts.find((p) => p.id === partId);
    if (!part) return;

    try {
      // 画像も消す
      if (part.imagePath) {
        await deleteObject(storageRef(storage, part.imagePath));
      }

      // Firestore doc を消す
      await deleteDoc(doc(db, "parts", partId));

      // 画面から消す
      setParts((prev) => prev.filter((p) => p.id !== partId));

      showMessage("削除しました");
    } catch (e) {
      console.error(e);
      showMessage("削除に失敗しました");
      throw e;
    }
  };

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
      // ① 先に doc 作る
      await setDoc(doc(db, "parts", trimmedId), {
        name: trimmedName || null,
        animal: input.animal || null,
        description: input.description || null,
        price: input.price ? Number(input.price) : null,
        stock: input.stock ? Number(input.stock) : null,
        imageUrl: null,
        imagePath: null,
      });

      let imageUrl = "";
      let imagePath: string | undefined = undefined;

      // ② 画像があればアップロード
      if (input.imageFile) {
        const ext = input.imageFile.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${ext}`;
        const safePartId = trimmedId.replace(/[^\w\-]/g, "_");
        const objectPath = `parts/${safePartId}/${fileName}`;

        const sref = storageRef(storage, objectPath);
        const snapshot = await uploadBytes(sref, input.imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
        imagePath = objectPath;

        await setDoc(
          doc(db, "parts", trimmedId),
          { imageUrl, imagePath },
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
        imagePath,
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
    deletePart,       // ✅ idで削除（画像も）
    deletePartImage,  // ✅ 画像だけ削除
    uploadPartImage,
    addPart,
    reload: loadParts,
  };
}
