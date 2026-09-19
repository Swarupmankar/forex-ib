import wordmarkFont from '../../brand/wordmark-font.json';
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
 * The wordmark font is embedded in the SVG so previews and downloads use
 * the canonical Montserrat weights even in an isolated image document.
 */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const creativeSvg = (asset: CreativeAsset, partner: Partner, link: string) => {
  const w = asset.width ?? 1200;
  const h = asset.height ?? 630;
  const wide = w / h > 3;
  const pad = Math.round(wide ? 18 : w * .08);
  const headline = Math.round(wide ? 22 : w * .073);
  const small = Math.round(wide ? 10 : w * .023);
  const brandSize = wide ? 12 : w * .028;
  const markSize = wide ? 20 : w * .06;
  const perLine = wide ? 48 : 24;
  const lines: string[] = [];
  let line = '';
  for (const word of asset.headline.split(' ')) {
    if ((line + ' ' + word).trim().length > perLine) { lines.push(line.trim()); line = word; }
    else line += ` ${word}`;
  }
  if (line.trim()) lines.push(line.trim());
  const blockTop = wide ? 51 : h * .4;
  const maxLinkChars = wide ? 88 : 56;
  const linkLines = link.match(new RegExp(`.{1,${maxLinkChars}}`, 'g')) ?? [link];
  const mark = (x: number, y: number, size: number, opacity = 1) => `<g transform="translate(${x} ${y}) scale(${size / 495})" opacity="${opacity}"><polygon points="4,4 164,125 164,370 4,491" fill="#f4f6f5"/><polygon points="452,4 292,125 292,370 452,491" fill="#b0f000"/></g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs><style>@font-face{font-family:MovementWordmark;font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${wordmarkFont.data}) format("woff2")}</style></defs><title>${esc(asset.name)}</title><desc>${esc(link)}</desc>
  <rect width="${w}" height="${h}" fill="#0c0c0c"/>
  ${!wide ? mark(w * .53, h * .42, w * .68, .065) : ''}
  ${mark(pad, wide ? 10 : pad, markSize)}
  <text x="${pad + markSize * 1.2}" y="${(wide ? 10 : pad) + markSize * .65}" font-family="MovementWordmark,Montserrat,sans-serif" font-size="${brandSize}" fill="#fff"><tspan font-weight="700">Movement</tspan><tspan font-weight="300"> Markets</tspan></text>
  <text x="${w - pad}" y="${(wide ? 10 : pad) + markSize * .65}" text-anchor="end" font-family="Helvetica,Arial,sans-serif" font-size="${small}" fill="#b0f000">${esc(partner.code)}</text>
  ${lines.map((l, i) => `<text x="${pad}" y="${blockTop + i * headline * 1.18}" font-family="Helvetica,Arial,sans-serif" font-size="${headline}" font-weight="600" fill="#fff" letter-spacing="${-headline * .035}">${esc(l)}</text>`).join('')}
  ${!wide ? `<rect x="${pad}" y="${blockTop + lines.length * headline * 1.18 + 20}" width="${w * .075}" height="4" rx="2" fill="#b0f000"/>` : ''}
  ${linkLines.slice(0, wide ? 1 : 3).map((l, i) => `<text x="${pad}" y="${h - pad - (wide ? 0 : small * 3.5) + i * small * 1.4}" font-family="Helvetica,Arial,sans-serif" font-size="${small}" fill="#acb6bd">${esc(l)}${wide && linkLines.length > 1 ? '…' : ''}</text>`).join('')}
  ${!wide ? `<text x="${pad}" y="${h - pad}" font-family="Helvetica,Arial,sans-serif" font-size="${small * .8}" fill="#87949d">Trading involves risk. Capital at risk.</text>` : ''}
</svg>`;
};

/** The displayed creative and downloaded file use the same renderer. */
export const creativePreview = (asset: CreativeAsset, partner: Partner, link: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(creativeSvg(asset, partner, link))}`;

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
<html lang="en"><head><meta charset="utf-8"><defs><style>@font-face{font-family:MovementWordmark;font-style:normal;font-weight:100 900;src:url(data:font/woff2;base64,${wordmarkFont.data}) format("woff2")}</style></defs><title>${esc(asset.name)}</title></head>
<body style="margin:0;padding:0;background:#f3f5f8;font-family:Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px">
    <tr><td align="center">
      <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="padding:34px 32px;background:#101416;color:#ffffff">
          <div style="font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.45);font-weight:700">Invitation</div>
          <div style="font-size:26px;font-weight:800;letter-spacing:-.03em;margin-top:10px">${esc(asset.headline)}</div>
        </td></tr>
        <tr><td style="padding:28px 32px;color:#0B1016;font-size:15px;line-height:1.6">
          <p style="margin:0 0 18px">Open an account through the link below and you will be set up in minutes.</p>
          <p style="margin:0 0 24px">Use code <b style="font-family:monospace">${esc(partner.code)}</b> at sign-up.</p>
          <a href="${esc(link)}" style="display:inline-block;background:#b0f000;color:#152000;text-decoration:none;padding:13px 22px;border-radius:11px;font-weight:700;font-size:15px">Open an account</a>
          <p style="margin:24px 0 0;font-size:12px;color:#687380;word-break:break-all">${esc(link)}</p>
        </td></tr>
      </table>
      <p style="font-size:11px;color:#687380;margin:18px 0 0">Trading involves risk. Capital at risk.</p>
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
