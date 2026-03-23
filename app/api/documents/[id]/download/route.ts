export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return NextResponse.json({ error: "Document introuvable" }, { status: 404 });

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
    return NextResponse.json({ error: "Fichier introuvable sur le serveur" }, { status: 404 });
  }
}
