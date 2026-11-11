export function formatDate(isoString, withTime = false) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (withTime) {
    return date.toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }
  return date.toLocaleDateString("fr-FR");
}