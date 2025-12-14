// functions/src/lib/push.ts
import * as admin from "firebase-admin";
import { deleteAdminTokensByToken } from "./adminTokens";

type SendPushArgs = {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  // webpush link を使いたいなら url を渡す（任意）
  url?: string;
};

export async function sendPushToAdmins(args: SendPushArgs) {
  const tokens = Array.from(new Set(args.tokens)).filter((t) => t && t.length > 0);
  if (!tokens.length) return;

  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title: args.title,
      body: args.body,
    },
    data: args.data ?? {},
    ...(args.url
      ? { webpush: { fcmOptions: { link: args.url } } }
      : {}),
  };

  const res = await admin.messaging().sendEachForMulticast(message);

  // 無効トークン掃除（tokenフィールド一致で削除）
  const invalid: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = (r.error as any)?.code ?? "";
      if (
        String(code).includes("registration-token-not-registered") ||
        String(code).includes("invalid-argument") ||
        String(code).includes("UNREGISTERED")
      ) {
        invalid.push(tokens[i]);
      }
    }
  });

  if (invalid.length) {
    await deleteAdminTokensByToken(invalid);
  }
}
