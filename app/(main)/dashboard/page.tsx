"use client";

import { useEffect, useState, useCallback } from "react";
import { TicketRow } from "@/components/dashboard/TicketRow";
import { StatsCard } from "@/components/ui/StatsCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDateTime, documentTypeLabel } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Stats   { totalProducts: number; totalTickets: number; totalDocuments: number; openTickets: number; pendingDocs: number }
interface Ticket  { id: string; title: string; description: string; status: string; productRef?: string | null; createdAt: string; user: { name: string; email: string }; product?: { name: string; brand: { name: string } } | null }
interface Doc     { id: string; name: string; originalName: string; type: string; confirmed: boolean; uploadedAt: string; brand?: { name: string } | null; product?: { name: string } | null }

type Tab = "tickets" | "documents";

export default function DashboardPage() {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [tickets,  setTickets]  = useState<Ticket[]>([]);
  const [docs,     setDocs]     = useState<Doc[]>([]);
  const [tab,      setTab]      = useState<Tab>("tickets");
  const [loading,  setLoading]  = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [statsRes, ticketsRes, docsRes] = await Promise.all([
      fetch("/api/stats"),
      fetch(`/api/tickets${statusFilter ? `?status=${statusFilter}` : ""}`),
      fetch("/api/documents"),
    ]);
    const [s, t, d] = await Promise.all([statsRes.json(), ticketsRes.json(), docsRes.json()]);
    setStats(s);
    setTickets(t);
    setDocs(d);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (id: string, status: string) => {
    await fetch(`/api/tickets/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    loadData();
  };

  const handleConfirmDoc = async (id: string) => {
    await fetch(`/api/documents/${id}/confirm`, { method: "POST" });
    loadData();
  };

  const handleDeleteDoc = async (id: string) => {
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    loadData();
  };

  const handleFileDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: formData });
    if (res.ok) {
      const doc = await res.json();
      router.push(`/preview/${doc.id}`);
    }
  }, [router]);

  return (
    <div
      className="max-w-7xl mx-auto px-4 py-10"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleFileDrop}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-delabie-text">Tableau de bord</h1>
          <p className="text-delabie-gray-dark mt-1">Gestion des tickets et documents SAV.</p>
        </div>
        <div className="flex items-center gap-2 bg-delabie-blue-pale border border-delabie-blue/20 rounded-xl px-4 py-2 text-sm text-delabie-blue">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Glissez un document ici pour l&apos;analyser
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard label="Produits" value={stats.totalProducts} icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          } />
          <StatsCard label="Tickets totaux" value={stats.totalTickets} icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          } color="bg-yellow-100 text-yellow-700" />
          <StatsCard label="Tickets ouverts" value={stats.openTickets} icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          } color="bg-red-100 text-red-700" />
          <StatsCard label="Documents confirmés" value={stats.totalDocuments} icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          } color="bg-green-100 text-green-700" sub={stats.pendingDocs > 0 ? `${stats.pendingDocs} en attente` : undefined} />
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {(["tickets", "documents"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                tab === t
                  ? "text-delabie-blue border-b-2 border-delabie-blue bg-delabie-blue-pale/50"
                  : "text-delabie-gray-dark hover:text-delabie-text hover:bg-delabie-gray"
              }`}
            >
              {t === "tickets" ? `🎫 Tickets (${tickets.length})` : `📄 Documents (${docs.length})`}
            </button>
          ))}
        </div>

        {/* Tickets tab */}
        {tab === "tickets" && (
          <div>
            {/* Filter bar */}
            <div className="px-4 py-3 border-b border-gray-100 flex gap-2 flex-wrap">
              {["", "OUVERT", "EN_COURS", "RESOLU", "FERME"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    statusFilter === s
                      ? "bg-delabie-blue text-white"
                      : "bg-delabie-gray text-delabie-gray-dark hover:bg-delabie-blue-pale"
                  }`}
                >
                  {s === "" ? "Tous" : s === "OUVERT" ? "Ouverts" : s === "EN_COURS" ? "En cours" : s === "RESOLU" ? "Résolus" : "Fermés"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="p-8 text-center text-delabie-gray-dark">Chargement…</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center text-delabie-gray-dark">Aucun ticket trouvé.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs text-delabie-gray-dark uppercase tracking-wide">
                      <th className="px-4 py-3">Titre</th>
                      <th className="px-4 py-3">Produit</th>
                      <th className="px-4 py-3">Statut</th>
                      <th className="px-4 py-3">Agent</th>
                      <th className="px-4 py-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {tickets.map((t) => (
                      <TicketRow key={t.id} ticket={t} onStatusChange={handleStatusChange} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Documents tab */}
        {tab === "documents" && (
          <div>
            {loading ? (
              <div className="p-8 text-center text-delabie-gray-dark">Chargement…</div>
            ) : docs.length === 0 ? (
              <div className="p-8 text-center text-delabie-gray-dark">
                <p className="text-4xl mb-2">📁</p>
                <p>Aucun document. Glissez un fichier sur cette page ou utilisez le chatbot.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {docs.map((doc) => (
                  <div key={doc.id} className="px-6 py-4 flex items-center gap-4 hover:bg-delabie-gray transition-colors">
                    <div className="w-10 h-10 bg-delabie-blue-pale rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-delabie-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-delabie-text truncate">{doc.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">{documentTypeLabel(doc.type)}</span>
                        {doc.brand && <span className="text-xs text-gray-400">· {doc.brand.name}</span>}
                        <span className="text-xs text-gray-400">· {formatDateTime(doc.uploadedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={doc.confirmed ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                        {doc.confirmed ? "Confirmé" : "En attente"}
                      </Badge>
                      {!doc.confirmed && (
                        <Button size="sm" onClick={() => handleConfirmDoc(doc.id)}>Confirmer</Button>
                      )}
                      <a href={`/api/documents/${doc.id}/download`} className="text-xs text-delabie-blue hover:text-delabie-blue-dark font-medium">
                        Télécharger
                      </a>
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
