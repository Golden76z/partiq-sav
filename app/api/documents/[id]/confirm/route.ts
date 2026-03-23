export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const doc = await prisma.document.update({
    where: { id: params.id },
    data: { confirmed: true },
    include: { brand: true, product: true },
  });
  return NextResponse.json(doc);
}
