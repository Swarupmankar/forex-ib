/**
 * Client-side file generation. There is no server, so every "export" and
 * "download" in this app builds a real file in the browser and hands it to the
 * user — nothing is faked and nothing is requested over the network.
 */

/** RFC 4180: quote anything containing a comma, quote or newline; double inner quotes. */
const csvCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const toCsv = (headers: string[], rows: (string | number | null)[][]): string =>
  [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');

/**
 * Triggers a download. The object URL is revoked on the next tick rather than
 * immediately — Safari cancels the download if the URL dies in the same frame.
 */
export const downloadFile = (filename: string, content: BlobPart, mime: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export const downloadCsv = (filename: string, headers: string[], rows: (string | number | null)[][]) =>
  // the BOM keeps Excel from mangling the £/€/— characters
  downloadFile(filename, `﻿${toCsv(headers, rows)}`, 'text/csv;charset=utf-8');

export const downloadText = (filename: string, text: string) =>
  downloadFile(filename, text, 'text/plain;charset=utf-8');

/** `IB-referrals-2026-08-06.csv` */
export const stampedName = (base: string, iso: string, ext: string) =>
  `${base}-${iso.slice(0, 10)}.${ext}`;

/**
 * Copy helper shared by every copy affordance. Returns false rather than
 * throwing: navigator.clipboard rejects on insecure origins and when the
 * permission is denied, and a failed copy must not take the page down.
 */
export const copyText = async (value: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
};
