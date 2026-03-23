export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractDocumentData } from "@/lib/openai";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non supporté. Formats acceptés : PDF, Excel, CSV, Word" },
        { status: 400 }
      );
    }

    const uploadDir = process.env.UPLOAD_DIR ?? "./uploads";
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split(".").pop() ?? "bin";
    const fileName = `${randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Extract text from PDF (check both MIME type and extension)
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    let extractedText = "";
    if (isPdf) {
      try {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        extractedText = data.text ?? "";
        console.log("[upload] pdf-parse OK, chars:", extractedText.trim().length);
      } catch (pdfErr) {
        console.error("[upload] pdf-parse failed:", pdfErr);
        extractedText = "";
      }
    }

    // Use AI to extract structured data
    let extractedData = null;
    if (extractedText.trim().length > 50) {
      try {
        extractedData = await extractDocumentData(extractedText);
        console.log("[upload] extractedData:", JSON.stringify(extractedData));
      } catch (aiErr) {
        console.error("[upload] extractDocumentData failed:", aiErr);
      }
    } else {
      console.warn("[upload] extractedText too short or empty, length:", extractedText.trim().length);
    }

    // Find brand and product if detected
    let brandId: string | null = null;
    let productId: string | null = null;

    if (extractedData?.brand) {
      const brand = await prisma.brand.findFirst({
        where: { name: { contains: extractedData.brand, mode: "insensitive" } },
      });
      brandId = brand?.id ?? null;
    }

    if (extractedData?.reference) {
      const product = await prisma.product.findFirst({
        where: { reference: { contains: extractedData.reference, mode: "insensitive" } },
      });
      productId = product?.id ?? null;
    }

    const docType = extractedData?.documentType ?? "AUTRE";
    const validTypes = ["FICHE_TECHNIQUE", "CATALOGUE", "MANUEL", "BON_COMMANDE", "AUTRE"];
    const type = validTypes.includes(docType) ? docType : "AUTRE";

    const document = await prisma.document.create({
      data: {
        name: file.name.replace(/\.[^/.]+$/, ""),
        originalName: file.name,
        filePath,
        fileSize: buffer.length,
        mimeType: file.type,
        type: type as never,
        extractedData: extractedData ?? undefined,
        confirmed: false,
        brandId,
        productId,
      },
      include: { brand: true, product: true },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Erreur lors du traitement du fichier" }, { status: 500 });
  }
}
