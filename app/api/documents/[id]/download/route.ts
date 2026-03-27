export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "node:fs/promises";

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
  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc)
    return NextResponse.json(
      { error: "Document introuvable" },
      { status: 404 },
    );

  try {
    const buffer = await readFile(doc.filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(doc.originalName)}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Fichier introuvable sur le serveur" },
      { status: 404 },
    );
  }
}
