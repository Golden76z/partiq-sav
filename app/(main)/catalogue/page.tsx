"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { Input } from "@/components/ui/Input";

interface Brand    { id: string; name: string }
interface Product  {
  id: string; name: string; reference: string; category: string;
  description?: string | null;
  brand: { id: string; name: string };
  spareParts: { id: string; name: string; reference: string; stock: number }[];
  _count?: { tickets: number; documents: number };
}

const CATEGORIES = ["Robinet temporisé", "Mitigeur thermostatique", "Robinet poussoir",
  "Robinet électronique", "Filtre anti-bactérien", "Mitigeur cuisine",
  "Mitigeur lavabo", "Robinet cuisine", "Robinet collectivité",
  "Mitigeur thermostatique douche", "Robinet urinoir", "Robinet hygiène"];

export default function CataloguePage() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [brands,    setBrands]    = useState<Brand[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [brandId,   setBrandId]   = useState("");
  const [category,  setCategory]  = useState("");

  useEffect(() => {
    fetch("/api/brands").then((r) => r.json()).then(setBrands);
  }, []);

  useEffect(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search)   p.set("search",   search);
    if (brandId)  p.set("brandId",  brandId);
    if (category) p.set("category", category);

    fetch(`/api/products?${p}`).then((r) => r.json()).then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, [search, brandId, category]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-delabie-text mb-1">Catalogue produits</h1>
        <p className="text-delabie-gray-dark">Produits, pièces détachées et fiches techniques DELABIE, KWC et DVS.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-48">
          <Input
            label="Rechercher"
            placeholder="Nom, référence, description…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-delabie-text">Marque</label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-delabie-blue bg-white"
          >
            <option value="">Toutes les marques</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-delabie-text">Catégorie</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none focus:ring-2 focus:ring-delabie-blue bg-white"
          >
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {(search || brandId || category) && (
          <button
            onClick={() => { setSearch(""); setBrandId(""); setCategory(""); }}
            className="text-sm text-delabie-blue hover:text-delabie-blue-dark font-medium self-end pb-2"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-delabie-gray-dark mb-4">
        {loading ? "Chargement…" : `${products.length} produit${products.length !== 1 ? "s" : ""} trouvé${products.length !== 1 ? "s" : ""}`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 h-48 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-delabie-gray-dark">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-medium">Aucun produit trouvé</p>
          <p className="text-sm mt-1">Modifiez vos filtres ou posez une question à l&apos;assistant SAV.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
