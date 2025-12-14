import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";

if (!admin.apps.length) admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

export const notifyAdmins = onRequest({ region: "us-central1" }, async (req, res) => {
  try {
    // ✅ HTTPSなので event.params は存在しない。全部 req.body から受け取る
    const { title, body, url, requestId } = req.body ?? {};

    if (typeof title !== "string" || title.trim() === "") {
      res.status(400).send("title is required");
      return;
    }
    if (typeof body !== "string" || body.trim() === "") {
      res.status(400).send("body is required");
      return;
    }

    // ✅ adminTokens 取得（tokenフィールドを読む）
    const snap = await db.collection("adminTokens").get();
    const tokens = Array.from(
      new Set(
        snap.docs
          .map((d) => d.data()?.token)
          .filter((t): t is string => typeof t === "string" && t.length > 0)
      )
    );

    if (tokens.length === 0) {
      res.status(200).send("No valid tokens");
      return;
    }

    // ✅ data-only push（SW側で showNotification する前提）
    const result = await messaging.sendEachForMulticast({
      tokens,
      data: {
        title: title,
        body: body.slice(0, 60),
        url: typeof url === "string" && url ? url : "/admin",
        requestId: typeof requestId === "string" ? requestId : "",
      },
    });

    res.status(200).json({
      successCount: result.successCount,
      failureCount: result.failureCount,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Internal error");
  }
});
