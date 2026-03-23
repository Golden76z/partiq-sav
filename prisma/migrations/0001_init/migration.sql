-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT');
CREATE TYPE "TicketStatus" AS ENUM ('OUVERT', 'EN_COURS', 'RESOLU', 'FERME');
CREATE TYPE "DocumentType" AS ENUM ('FICHE_TECHNIQUE', 'CATALOGUE', 'MANUEL', 'BON_COMMANDE', 'AUTRE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Product_reference_key" ON "Product"("reference");

CREATE TABLE "SparePart" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "description" TEXT,
    "compatibility" TEXT[],
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SparePart_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SparePart_reference_key" ON "SparePart"("reference");

CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'AUTRE',
    "extractedData" JSONB,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "brandId" TEXT,
    "productId" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT,
    "productRef" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OUVERT',
    "attachments" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Product"     ADD CONSTRAINT "Product_brandId_fkey"      FOREIGN KEY ("brandId")    REFERENCES "Brand"("id")       ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SparePart"  ADD CONSTRAINT "SparePart_productId_fkey"  FOREIGN KEY ("productId")  REFERENCES "Product"("id")     ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Document"   ADD CONSTRAINT "Document_brandId_fkey"     FOREIGN KEY ("brandId")    REFERENCES "Brand"("id")       ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Document"   ADD CONSTRAINT "Document_productId_fkey"   FOREIGN KEY ("productId")  REFERENCES "Product"("id")     ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Ticket"     ADD CONSTRAINT "Ticket_userId_fkey"        FOREIGN KEY ("userId")     REFERENCES "User"("id")        ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket"     ADD CONSTRAINT "Ticket_productId_fkey"     FOREIGN KEY ("productId")  REFERENCES "Product"("id")     ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ChatSession" ADD CONSTRAINT "ChatSession_userId_fkey"  FOREIGN KEY ("userId")     REFERENCES "User"("id")        ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Message"    ADD CONSTRAINT "Message_sessionId_fkey"    FOREIGN KEY ("sessionId")  REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
