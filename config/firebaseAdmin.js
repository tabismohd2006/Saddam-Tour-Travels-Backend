import "dotenv/config";

import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

const serviceAccountBase64 =
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

console.log(
  "Firebase env check:",
  Boolean(serviceAccountBase64)
);

if (!serviceAccountBase64) {
  throw new Error(
    "Firebase service account environment variable is missing"
  );
}

const serviceAccount = JSON.parse(
  Buffer.from(serviceAccountBase64, "base64").toString("utf8")
);

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount),
    });

export const messaging = getMessaging(app);

console.log("✅ Firebase Admin Connected");

export default { messaging: () => messaging };