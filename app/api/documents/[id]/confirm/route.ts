export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  context: { params: { id: string } } | { params: Promise<{ id: string }> },
) {
  let id: string;
  if (context.params instanceof Promise) {
    const resolved = await context.params;
    id = resolved.id;
  } else {
    id = context.params.id;
  }
  const doc = await prisma.document.update({
    where: { id },
    data: { confirmed: true },
    include: { brand: true, product: true },
  });
  return NextResponse.json(doc);
}
