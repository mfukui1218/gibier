import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

const db = admin.firestore();
const messaging = admin.messaging();

export const notifyAdmins = onRequest(async (req, res) => {
  try {
    const { title, body, url } = req.body;

    if (!title || !body) {
      res.status(400).send("title and body are required");
      return;
    }

    const snap = await db.collection("adminTokens").get();
    if (snap.empty) {
      res.status(200).send("No admin tokens");
      return;
    }

    const tokens: string[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.token) tokens.push(data.token);
    });

    if (tokens.length === 0) {
      res.status(200).send("No valid tokens");
      return;
    }

    const result = await messaging.sendMulticast({
      tokens,
      notification: { title, body },
      data: { url: url || "/admin" },
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
