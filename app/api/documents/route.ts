export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const brandId = searchParams.get("brandId");
  const confirmed = searchParams.get("confirmed");
  const type = searchParams.get("type");

  const documents = await prisma.document.findMany({
    where: {
      ...(brandId && { brandId }),
      ...(confirmed !== null && { confirmed: confirmed === "true" }),
      ...(type && { type: type as never }),
    },
    include: {
      brand: true,
      product: true,
    },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(documents);
}
