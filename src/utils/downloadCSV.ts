import type { DataRow } from '../store/useAppStore';

/**
 * Converts the current dataset to a CSV string and triggers a browser download.
 * @param data     Array of data rows
 * @param columns  Ordered column names
 * @param filename Download filename (without extension)
 */
export const downloadCSV = (
  data: DataRow[],
  columns: string[],
  filename = 'cleaned_dataset'
): void => {
  if (!data.length || !columns.length) return;

  // Header row
  const escape = (val: unknown): string => {
    const str = val == null ? '' : String(val);
    // Wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.map(escape).join(',');
  const rows = data.map(row => columns.map(col => escape(row[col])).join(','));
  const csv = [header, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href        = url;
  link.download    = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
