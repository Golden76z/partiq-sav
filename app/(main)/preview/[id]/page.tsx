"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { documentTypeLabel, formatDateTime, formatFileSize } from "@/lib/utils";

interface ExtractedData {
  brand?: string | null;
  product?: string | null;
  reference?: string | null;
  spareParts?: string[];
  documentType?: string;
  summary?: string;
}

interface Document {
  id: string;
  name: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  type: string;
  confirmed: boolean;
  uploadedAt: string;
  extractedData: ExtractedData | null;
  brand?: { name: string } | null;
  product?: { name: string; reference: string } | null;
}

export default function PreviewPage() {
  const { id }                    = useParams<{ id: string }>();
  const router                    = useRouter();
  const [doc,       setDoc]       = useState<Document | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((r) => r.json())
      .then((d) => { setDoc(d); setLoading(false); });
  }, [id]);

  const handleConfirm = async () => {
    setConfirming(true);
    await fetch(`/api/documents/${id}/confirm`, { method: "POST" });
    router.push("/dashboard");
  };

  const handleDiscard = async () => {
    setDeleting(true);
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-64 bg-white rounded-2xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!doc || doc.id !== id) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-delabie-gray-dark">Document introuvable ou expiré.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-4">Retour</Button>
      </div>
    );
  }

  const extracted = doc.extractedData;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-yellow-100 text-yellow-700">Aperçu — non confirmé</Badge>
        </div>
        <h1 className="text-2xl font-bold text-delabie-text">Analyse du document</h1>
        <p className="text-delabie-gray-dark text-sm mt-1">
          Vérifiez les données extraites avant de les intégrer à la base de connaissances.
        </p>
      </div>

      {/* Document info */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="font-semibold text-delabie-text mb-4 flex items-center gap-2">
          <span>📁</span> Informations du fichier
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Nom original</p>
            <p className="font-medium text-delabie-text">{doc.originalName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Taille</p>
            <p className="font-medium text-delabie-text">{formatFileSize(doc.fileSize)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Type détecté</p>
            <p className="font-medium text-delabie-text">{documentTypeLabel(doc.type)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Déposé le</p>
            <p className="font-medium text-delabie-text">{formatDateTime(doc.uploadedAt)}</p>
          </div>
        </div>
      </div>

      {/* Extracted data */}
      {extracted ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
          <h2 className="font-semibold text-delabie-text mb-4 flex items-center gap-2">
            <span>🤖</span> Données extraites par l&apos;IA
          </h2>

            {extracted.summary ? (
            <div className="bg-delabie-blue-pale rounded-xl p-4 mb-4 border border-delabie-blue/10">
              <p className="text-sm text-delabie-blue font-medium mb-1">Résumé</p>
              <p className="text-sm text-delabie-text">{extracted.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Marque détectée</p>
              <p className="font-medium text-delabie-text">
                  {extracted.brand?.name ?? <span className="text-gray-400 italic">Non détectée</span>}
              </p>
              {doc.brand && (
                <p className="text-xs text-green-600 mt-0.5">✓ Trouvée en base : {doc.brand.name}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Produit</p>
              <p className="font-medium text-delabie-text">
                  {extracted.product?.name ?? <span className="text-gray-400 italic">Non détecté</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Référence principale</p>
              <p className="font-medium font-mono text-delabie-text">
                  {extracted.reference?.toString() ?? <span className="text-gray-400 italic">Non trouvée</span>}
              </p>
              {doc.product && (
                <p className="text-xs text-green-600 mt-0.5">✓ Produit en base : {doc.product.name}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Type de document</p>
              <p className="font-medium text-delabie-text">{documentTypeLabel(extracted.documentType ?? "AUTRE")}</p>
            </div>
          </div>

          {extracted.spareParts && extracted.spareParts.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Pièces détachées détectées</p>
              <div className="flex flex-wrap gap-2">
                {extracted.spareParts.map((ref, i) => (
                  <span key={i} className="bg-delabie-gray text-delabie-text text-xs font-mono px-2 py-1 rounded-lg">
                    {ref}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6">
          <p className="text-sm text-yellow-700">
            ⚠️ Aucune donnée n&apos;a pu être extraite automatiquement (document non-PDF ou contenu insuffisant).
            Vous pouvez tout de même confirmer l&apos;archivage du fichier.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <a
          href={`/api/documents/${id}/download`}
          className="text-sm text-delabie-blue hover:text-delabie-blue-dark font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Télécharger le fichier original
        </a>

        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={handleDiscard} loading={deleting}>
            Rejeter
          </Button>
          <Button onClick={handleConfirm} loading={confirming}>
            ✓ Confirmer et archiver
          </Button>
        </div>
      </div>
    </div>
  );
}
