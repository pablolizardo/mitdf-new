import webpush from "web-push";
import { prisma } from "@/lib/db";

const BASE_URL = "https://mitdf.com.ar";

function getVapidKeys() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys: set NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY");
  }
  return { publicKey, privateKey };
}

export function setVapidDetails() {
  const { publicKey, privateKey } = getVapidKeys();
  webpush.setVapidDetails(
    `mailto:info@mitdf.com.ar`,
    publicKey,
    privateKey
  );
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

export async function sendPushToSubscription(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  setVapidDetails();
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };
  await webpush.sendNotification(
    pushSubscription,
    JSON.stringify(payload),
    { TTL: 86400 }
  );
}

export async function sendPushToAllSubscriptions(
  payload: PushPayload,
  filter: { farmacias?: boolean; barcaza?: boolean } = {}
) {
  const where: { farmacias?: boolean; barcaza?: boolean } = {};
  if (filter.farmacias !== undefined) where.farmacias = filter.farmacias;
  if (filter.barcaza !== undefined) where.barcaza = filter.barcaza;

  const subs = await prisma.pushSubscription.findMany({ where });
  const results = { sent: 0, failed: 0 };
  for (const sub of subs) {
    try {
      await sendPushToSubscription(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      );
      results.sent++;
    } catch (e) {
      results.failed++;
      if (results.failed <= 3) {
        console.error("Push send failed for subscription", sub.id, e);
      }
      if (e && typeof e === "object" && "statusCode" in e && (e as { statusCode: number }).statusCode === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  }
  return results;
}
