import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

interface Product {
  id: string;
  name: string;
  reference: string;
  category: string;
  description?: string | null;
  brand: { id: string; name: string };
  spareParts: { id: string; name: string; reference: string; stock: number }[];
  _count?: { tickets: number; documents: number };
}

const brandColors: Record<string, string> = {
  DELABIE: "bg-delabie-blue-pale text-delabie-blue",
  KWC: "bg-emerald-50 text-emerald-700",
  DVS: "bg-purple-50 text-purple-700",
};

export function ProductCard({ product }: { product: Product }) {
  const color = brandColors[product.brand.name] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-delabie-text truncate">{product.name}</p>
          <p className="text-xs text-delabie-gray-dark font-mono mt-0.5">{product.reference}</p>
        </div>
        <Badge className={color}>{product.brand.name}</Badge>
      </div>

      <p className="text-xs text-gray-500 bg-delabie-gray rounded-lg px-2 py-1 inline-block w-fit">
        {product.category}
      </p>

      {product.description && (
        <p className="text-sm text-delabie-gray-dark line-clamp-2">{product.description}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          {product.spareParts.length} pièce{product.spareParts.length !== 1 ? "s" : ""}
        </span>
        <Link
          href={`/catalogue/${product.id}`}
          className="text-xs font-medium text-delabie-blue hover:text-delabie-blue-dark transition-colors"
        >
          Voir détails →
        </Link>
      </div>
    </div>
  );
}
