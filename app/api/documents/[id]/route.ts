export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
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
  const doc = await prisma.document.findUnique({
    where: { id },
    include: { brand: true, product: true },
  });
  if (!doc)
    return NextResponse.json(
      { error: "Document introuvable" },
      { status: 404 },
    );
  return NextResponse.json(doc);
}

export async function DELETE(
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
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc)
    return NextResponse.json(
      { error: "Document introuvable" },
      { status: 404 },
    );

  // Delete file from filesystem
  const fs = await import("node:fs/promises");
  try {
    await fs.unlink(doc.filePath);
  } catch {
    // File might not exist, continue
  }

  await prisma.document.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
