import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  try {
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Impossible de supprimer la marque" },
      { status: 500 },
    );
  }
}
