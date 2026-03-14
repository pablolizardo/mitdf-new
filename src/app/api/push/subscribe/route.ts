import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys, farmacias = true, barcaza = true } = body as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
      farmacias?: boolean;
      barcaza?: boolean;
    };

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json(
        { error: "Missing endpoint or keys" },
        { status: 400 }
      );
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        farmacias: !!farmacias,
        barcaza: !!barcaza,
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        farmacias: !!farmacias,
        barcaza: !!barcaza,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Push subscribe error", e);
    return NextResponse.json({ error: "Subscribe failed" }, { status: 500 });
  }
}
