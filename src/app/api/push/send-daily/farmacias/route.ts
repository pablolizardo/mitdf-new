import { NextRequest, NextResponse } from "next/server";
import { sendFarmaciasNotification } from "../send-daily";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await sendFarmaciasNotification();
  return NextResponse.json({ ok: true, ...result });
}
