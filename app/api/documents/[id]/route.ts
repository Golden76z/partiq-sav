export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: { brand: true, product: true },
  });
  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });

  // Delete file from filesystem
  const fs = await import("fs/promises");
  try {
    await fs.unlink(doc.filePath);
  } catch {
    // File might not exist, continue
  }

  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
