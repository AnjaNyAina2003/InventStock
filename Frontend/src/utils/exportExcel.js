export function exportToExcel(rows, filename = "export") {
  if (!rows || rows.length === 0) return;

  const headers = Object.keys(rows[0]);
  const DELIMITER = ";";

  const escapeCell = (value) => {
    const str = value === null || value === undefined ? "" : String(value);
    if (new RegExp(`["${DELIMITER}\\n]`).test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escapeCell).join(DELIMITER),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(DELIMITER)),
  ];

  const csvContent = "\uFEFF" + lines.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
