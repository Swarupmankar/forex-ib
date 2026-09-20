import QRCode from 'qrcode';
import { validReferralLink } from './referral';

/** Four-module quiet zone and an opaque white field are retained in every theme/export. */
export const createReferralQr = (link: string) => {
  if (!validReferralLink(link)) return null;
  try {
    const qr = QRCode.create(link, { errorCorrectionLevel: 'M' });
    const margin = 4;
    const size = qr.modules.size + margin * 2;
    const cells: [number, number][] = [];
    for (let row = 0; row < qr.modules.size; row++) {
      for (let col = 0; col < qr.modules.size; col++) {
        if (qr.modules.get(row, col)) cells.push([col + margin, row + margin]);
      }
    }
    const path = cells.map(([x, y]) => `M${x} ${y}h1v1h-1z`).join('');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 12}" height="${size * 12}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#ffffff"/><path d="${path}" fill="#111418"/></svg>`;
    return { size, cells, svg, dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` };
  } catch { return null; }
};

export const referralQrPng = async (qr: NonNullable<ReturnType<typeof createReferralQr>>): Promise<Blob> => {
  const scale = 16;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = qr.size * scale;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is unavailable');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = '#111418';
  for (const [x, y] of qr.cells) context.fillRect(x * scale, y * scale, scale, scale);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG export failed')), 'image/png'));
};
