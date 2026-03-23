"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, ticketStatusColor, ticketStatusLabel } from "@/lib/utils";

interface SparePart { id: string; name: string; reference: string; description?: string | null; compatibility: string[]; stock: number }
interface Document  { id: string; name: string; type: string; uploadedAt: string }
interface Ticket    { id: string; title: string; status: string; createdAt: string; user: { name: string } }
interface Product   {
  id: string; name: string; reference: string; category: string; description?: string | null;
  brand: { name: string };
  spareParts: SparePart[];
  documents:  Document[];
  tickets:    Ticket[];
}

const brandColors: Record<string, string> = {
  DELABIE: "bg-delabie-blue-pale text-delabie-blue",
  KWC:     "bg-emerald-50 text-emerald-700",
  DVS:     "bg-purple-50 text-purple-700",
};

export default function ProductDetailPage() {
  const { id }               = useParams<{ id: string }>();
  const router               = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => { setProduct(d); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-40 bg-white rounded-2xl border border-gray-200" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-center">
        <p className="text-delabie-gray-dark">Produit introuvable.</p>
        <Button onClick={() => router.push("/catalogue")} className="mt-4">Retour au catalogue</Button>
      </div>
    );
  }

  const color = brandColors[product.brand.name] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <button onClick={() => router.push("/catalogue")} className="text-sm text-delabie-blue hover:text-delabie-blue-dark mb-6 flex items-center gap-1">
        ← Retour au catalogue
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge className={color}>{product.brand.name}</Badge>
              <span className="text-xs text-gray-400 bg-delabie-gray px-2 py-0.5 rounded-full">{product.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-delabie-text">{product.name}</h1>
            <p className="text-sm font-mono text-delabie-gray-dark mt-1">Réf. {product.reference}</p>
          </div>
        </div>
        {product.description && (
          <p className="text-delabie-gray-dark mt-4 leading-relaxed border-t border-gray-100 pt-4">
            {product.description}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Spare Parts */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="font-semibold text-delabie-text mb-4 flex items-center gap-2">
            <span>🔧</span> Pièces détachées ({product.spareParts.length})
          </h2>
          {product.spareParts.length === 0 ? (
            <p className="text-sm text-gray-400">Aucune pièce détachée référencée.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {product.spareParts.map((sp) => (
                <div key={sp.id} className="border border-gray-100 rounded-xl p-3 hover:bg-delabie-gray transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-delabie-text">{sp.name}</p>
                      <p className="text-xs font-mono text-delabie-gray-dark mt-0.5">{sp.reference}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      sp.stock > 10 ? "bg-green-100 text-green-700"
                      : sp.stock > 0 ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                    }`}>
                      {sp.stock > 0 ? `Stock : ${sp.stock}` : "Rupture"}
                    </span>
                  </div>
                  {sp.description && <p className="text-xs text-gray-500 mt-1">{sp.description}</p>}
                  {sp.compatibility.length > 1 && (
                    <p className="text-xs text-delabie-gray-dark mt-1">
                      Compatible : {sp.compatibility.filter((c) => c !== product.reference).join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Documents + Tickets */}
        <div className="flex flex-col gap-6">
          {/* Documents */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-delabie-text mb-4 flex items-center gap-2">
              <span>📄</span> Documents ({product.documents.length})
            </h2>
            {product.documents.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun document confirmé.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {product.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-2 border border-gray-100 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-medium text-delabie-text truncate max-w-40">{doc.name}</p>
                      <p className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</p>
                    </div>
                    <a
                      href={`/api/documents/${doc.id}/download`}
                      className="text-xs text-delabie-blue hover:text-delabie-blue-dark font-medium"
                    >
                      Télécharger
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tickets */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-delabie-text mb-4 flex items-center gap-2">
              <span>🎫</span> Tickets récents
            </h2>
            {product.tickets.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun ticket pour ce produit.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {product.tickets.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 border border-gray-100 rounded-xl p-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-delabie-text truncate">{t.title}</p>
                      <p className="text-xs text-gray-400">{t.user.name} · {formatDate(t.createdAt)}</p>
                    </div>
                    <Badge className={ticketStatusColor(t.status)}>{ticketStatusLabel(t.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
