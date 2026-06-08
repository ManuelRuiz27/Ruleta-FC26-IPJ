export function exportToJSON(filename: string, data: unknown) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  downloadBlob(blob, `${filename}.json`);
}

export function exportToCSV(filename: string, data: object[], headers?: { key: string; label: string }[]) {
  if (!data || data.length === 0) {
    alert("No hay datos para exportar.");
    return;
  }

  // If no headers provided, extract them from the first object
  const csvHeaders = headers ?? (() => {
    const keys = Object.keys(data[0]);
    return keys.map(k => ({ key: k, label: k }));
  })();

  const csvRows = [];
  
  // Create Header Row
  const headerRow = csvHeaders.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
  csvRows.push(headerRow);

  // Create Data Rows
  for (const row of data) {
    const rowRecord = row as Record<string, unknown>;
    const values = csvHeaders.map(h => {
      let val = rowRecord[h.key];
      if (val === null || val === undefined) {
        val = '';
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvStr = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8;' }); // \uFEFF for Excel UTF-8 BOM
  downloadBlob(blob, `${filename}.csv`);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
