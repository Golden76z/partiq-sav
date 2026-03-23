export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function ticketStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    OUVERT: "Ouvert",
    EN_COURS: "En cours",
    RESOLU: "Résolu",
    FERME: "Fermé",
  };
  return labels[status] ?? status;
}

export function ticketStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OUVERT: "bg-red-100 text-red-700",
    EN_COURS: "bg-yellow-100 text-yellow-700",
    RESOLU: "bg-green-100 text-green-700",
    FERME: "bg-gray-100 text-gray-600",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function documentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FICHE_TECHNIQUE: "Fiche technique",
    CATALOGUE: "Catalogue",
    MANUEL: "Manuel",
    BON_COMMANDE: "Bon de commande",
    AUTRE: "Autre",
  };
  return labels[type] ?? type;
}
