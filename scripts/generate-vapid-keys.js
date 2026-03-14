/**
 * Generate VAPID keys for Web Push. Run once and add to .env:
 *   node scripts/generate-vapid-keys.js
 *
 * Add to .env:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<publicKey>
 *   VAPID_PRIVATE_KEY=<privateKey>
 */
const webpush = require("web-push");
const keys = webpush.generateVAPIDKeys();
console.log("Add these to your .env (or Vercel env vars):\n");
console.log("NEXT_PUBLIC_VAPID_PUBLIC_KEY=" + keys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + keys.privateKey);
