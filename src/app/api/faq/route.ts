import { NextResponse } from "next/server";
import { getFaqs } from "@/services/faq";

export async function GET() {
  const faqs = await getFaqs();
  return NextResponse.json(faqs);
}
