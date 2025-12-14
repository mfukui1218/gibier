// functions/src/lib/push.ts
import * as admin from "firebase-admin";
import { deleteAdminTokensByToken } from "./adminTokens";

type SendPushArgs = {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  url?: string;
};

export async function sendPushToAdmins(args: SendPushArgs) {
  const tokens = Array.from(new Set(args.tokens)).filter((t) => t && t.length > 0);
  if (!tokens.length) return;

  // ✅ data-only（ここが重要：notificationを送らない）
  const message: admin.messaging.MulticastMessage = {
    tokens,
    data: {
      ...(args.data ?? {}),
      title: args.title,
      body: args.body,
      url: args.url ?? (args.data?.url ?? "/admin"),
    },
    webpush: {
      fcmOptions: { link: args.url ?? (args.data?.url ?? "/admin") },
    },
  };

  const res = await admin.messaging().sendEachForMulticast(message);

  const invalid: string[] = [];
  res.responses.forEach((r, i) => {
    if (!r.success) {
      const code = String((r.error as any)?.code ?? "");
      if (code.includes("registration-token-not-registered") || code.includes("invalid-argument") || code.includes("UNREGISTERED")) {
        invalid.push(tokens[i]);
      }
    }
  });

  if (invalid.length) await deleteAdminTokensByToken(invalid);
}
