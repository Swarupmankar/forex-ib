import { downloadFile, downloadText } from '../../lib/download';
import type { CreativeAsset, Partner } from '../../types';

/**
 * "Get" produces a real, usable file in the browser — no server, no placeholder.
 *
 * - png    → an SVG creative rasterised through a canvas to a true PNG at the
 *            stated pixel size, carrying the partner's own tracked link.
 * - html   → a standalone email file with the tracked link inlined.
 * - other  → a brief: the copy, the specs and the tracked link, as text.
 *
 * The SVG deliberately uses system font families. A creative referencing a web
 * font would render with a fallback anyway, because an SVG loaded as an image
 * is an isolated document and cannot see the page's fonts.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const creativeSvg = (asset: CreativeAsset, partner: Partner, link: string) => {
  const w = asset.width ?? 1200;
  const h = asset.height ?? 630;
  const wide = w / h > 3; // leaderboard strip

  const pad = Math.round(Math.min(w, h) * (wide ? 0.12 : 0.08));
  const headline = Math.round(wide ? h * 0.28 : Math.min(w, h) * 0.075);
  const small = Math.round(wide ? h * 0.15 : Math.min(w, h) * 0.032);

  // wrap the headline to a sensible measure for the shape
  const perLine = wide ? 52 : 26;
  const words = asset.headline.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if ((line + ' ' + word).trim().length > perLine) {
      lines.push(line.trim());
      line = word;
    } else line += ` ${word}`;
  }
  if (line.trim()) lines.push(line.trim());

  const blockTop = wide ? pad + headline : Math.round(h * 0.5) - (lines.length * headline * 1.2) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#123D2D"/><stop offset="44%" stop-color="#08221A"/><stop offset="100%" stop-color="#04110D"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0" r="0.9">
      <stop offset="0%" stop-color="#2FBF71" stop-opacity="0.34"/><stop offset="100%" stop-color="#2FBF71" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${lines
    .map(
      (l, i) =>
        `<text x="${pad}" y="${blockTop + i * headline * 1.2}" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="${headline}" font-weight="800" fill="#ffffff" letter-spacing="${-headline * 0.03}">${esc(l)}</text>`,
    )
    .join('\n  ')}
  <text x="${pad}" y="${h - pad}" font-family="ui-monospace,Menlo,Consolas,monospace" font-size="${small}" fill="#6DE3A4">${esc(link)}</text>
  <text x="${w - pad}" y="${pad + small}" text-anchor="end" font-family="Helvetica Neue,Helvetica,Arial,sans-serif" font-size="${small}" font-weight="700" fill="rgba(255,255,255,0.55)" letter-spacing="${small * 0.14}">CODE ${esc(partner.code)}</text>
</svg>`;
};

const RASTERISE_TIMEOUT_MS = 8_000;

const rasterise = (svg: string, w: number, h: number): Promise<Blob> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();

    // if neither onload nor onerror ever fires, the caller's busy flag would
    // strand that button disabled for the rest of the session
    const timer = setTimeout(() => {
      URL.revokeObjectURL(url);
      reject(new Error('rasterise timed out'));
    }, RASTERISE_TIMEOUT_MS);

    img.onload = () => {
      clearTimeout(timer);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('no 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))), 'image/png');
    };
    img.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      reject(new Error('svg failed to load'));
    };
    img.src = url;
  });

const emailHtml = (asset: CreativeAsset, partner: Partner, link: string) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${esc(asset.name)}</title></head>
<body style="margin:0;padding:0;background:#F1F3F7;font-family:Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="padding:34px 32px;background:linear-gradient(135deg,#123D2D,#04110D);color:#ffffff">
          <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.45);font-weight:700">Invitation</div>
          <div style="font-size:26px;font-weight:800;letter-spacing:-.03em;margin-top:10px">${esc(asset.headline)}</div>
        </td></tr>
        <tr><td style="padding:28px 32px;color:#0B1016;font-size:15px;line-height:1.6">
          <p style="margin:0 0 18px">Open an account through the link below and you will be set up in minutes.</p>
          <p style="margin:0 0 24px">Use code <b style="font-family:monospace">${esc(partner.code)}</b> at sign-up.</p>
          <a href="${esc(link)}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:11px;font-weight:700;font-size:15px">Open an account</a>
          <p style="margin:24px 0 0;font-size:12px;color:#94A0B0;word-break:break-all">${esc(link)}</p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:#94A0B0;margin:18px 0 0">Trading involves risk. Capital at risk.</p>
    </td></tr>
  </table>
</body></html>`;

const brief = (asset: CreativeAsset, partner: Partner, link: string) => `${asset.name.toUpperCase()}
${'='.repeat(asset.name.length)}

Format      ${asset.dimensions}
Kind        ${asset.kind}
Headline    ${asset.headline}

YOUR TRACKED LINK
${link}

Referral code: ${partner.code}

USAGE
- The link above already carries your partner code; do not edit the query string.
- Compliance-cleared copy only. Do not add performance claims or guarantees.
- Always keep the risk warning visible: "Trading involves risk. Capital at risk."

This brief was generated in your browser from the partner portal.
`;

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Returns a short description of what was delivered, for the confirmation. */
export const getAsset = async (
  asset: CreativeAsset,
  partner: Partner,
  link: string,
): Promise<string> => {
  const base = `${slug(asset.name)}-${partner.code}`;

  if (asset.format === 'png' && asset.width && asset.height) {
    const blob = await rasterise(creativeSvg(asset, partner, link), asset.width, asset.height);
    downloadFile(`${base}-${asset.width}x${asset.height}.png`, blob, 'image/png');
    return `${asset.width} × ${asset.height} PNG, co-branded with your code.`;
  }

  if (asset.format === 'html') {
    downloadFile(`${base}.html`, emailHtml(asset, partner, link), 'text/html;charset=utf-8');
    return 'Standalone HTML email with your tracked link inlined.';
  }

  downloadText(`${base}-brief.txt`, brief(asset, partner, link));
  return `Brief with your tracked link — ${asset.dimensions} production spec.`;
};
