import Link from "next/link";
import { Button } from "@/components/ui/Button";

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: "Digitalisation de documents",
    desc: "Déposez vos PDF, Excel ou Word. L'IA extrait automatiquement marque, référence et pièces détachées.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    title: "Base de connaissances",
    desc: "Catalogue centralisé des produits DELABIE, KWC et DVS — pièces détachées, compatibilités, stocks.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Assistant IA SAV",
    desc: "Chatbot spécialisé avec RAG — réponses précises sur les références, fiches techniques et diagnostics.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    title: "Gestion des tickets SAV",
    desc: "Création, suivi et historique complet des demandes — statuts, assignations et pièces jointes.",
  },
];

const brands = [
  { name: "DELABIE", desc: "Leader européen de la robinetterie pour lieux publics", color: "border-delabie-blue bg-delabie-blue-pale" },
  { name: "KWC",     desc: "Mitigeurs et robinets cuisine & lavabo haut de gamme",  color: "border-emerald-300 bg-emerald-50" },
  { name: "DVS",     desc: "Équipements thermostatiques et hygiène professionnelle", color: "border-purple-300 bg-purple-50" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-delabie-blue via-delabie-blue-dark to-[#001a4d] text-white py-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>Assistant IA SAV — DELABIE · KWC · DVS</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Modernisez votre<br />
            <span className="text-blue-200">service après-vente</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            PartiQ digitalise vos documents techniques, centralise votre base de connaissances
            et répond instantanément à vos demandes SAV grâce à l&apos;intelligence artificielle.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/catalogue">
              <Button size="lg" className="bg-white text-delabie-blue hover:bg-blue-50 font-semibold shadow-lg">
                Voir le catalogue
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="border-white/40 text-white bg-white/10 hover:bg-white/20">
                Tableau de bord
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-white border-b border-gray-200 py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { v: "3", l: "Marques supportées" },
            { v: "11+", l: "Produits catalogués" },
            { v: "11+", l: "Pièces référencées" },
            { v: "IA", l: "Réponses en temps réel" },
          ].map((s) => (
            <div key={s.l}>
              <p className="text-3xl font-bold text-delabie-blue">{s.v}</p>
              <p className="text-sm text-delabie-gray-dark mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-delabie-gray">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-delabie-text mb-3">Fonctionnalités clés</h2>
            <p className="text-delabie-gray-dark max-w-xl mx-auto">
              Une plateforme complète pour digitaliser et moderniser la gestion SAV des équipements sanitaires.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-delabie-blue-pale text-delabie-blue rounded-xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-delabie-text mb-1">{f.title}</h3>
                  <p className="text-sm text-delabie-gray-dark leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-delabie-text mb-3">Marques supportées</h2>
            <p className="text-delabie-gray-dark">Bases de données produits unifiées pour trois marques leaders.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {brands.map((b) => (
              <div key={b.name} className={`rounded-2xl border-2 p-6 text-center ${b.color}`}>
                <p className="text-2xl font-bold text-delabie-text mb-2">{b.name}</p>
                <p className="text-sm text-delabie-gray-dark">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-delabie-blue py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à commencer ?</h2>
          <p className="text-blue-200 mb-8">
            Essayez l&apos;assistant SAV ou explorez le catalogue de produits dès maintenant.
          </p>
          <p className="text-blue-300 text-sm">
            💬 Le chatbot est disponible en bas à droite de chaque page.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-delabie-blue-dark text-blue-300 text-xs text-center py-4">
        PartiQ SAV — Démonstrateur IA pour la gestion SAV robinetterie · DELABIE · KWC · DVS
      </footer>
    </div>
  );
}
