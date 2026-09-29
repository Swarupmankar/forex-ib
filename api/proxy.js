/**
 * Backend proxy for the Vercel deployment.
 *
 * The browser calls this app's own origin (/api/v1/...) and vercel.json rewrites
 * it here as /api/proxy?path=<rest>. In dev the Vite proxy does the same job.
 *
 * Environment (Vercel project settings):
 *   BACKEND_BASE_URL   https://api.../v1   backend base, including /v1
 */

const BACKEND_BASE_URL = (process.env.BACKEND_BASE_URL ?? '').replace(/\/+$/, '');

/** Hop-by-hop headers, plus the ones fetch() must set itself. */
const STRIP = new Set([
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'proxy-authorization',
  'proxy-authenticate',
  'te',
  'trailer',
  // fetch() decompresses the upstream body, so the original encoding/length no
  // longer describe what is sent to the browser.
  'content-encoding',
  'content-length',
]);

// Forward the raw body byte for byte instead of letting Vercel parse it.
export const config = { api: { bodyParser: false } };

const rawBody = async (req) => {
  if (req.method === 'GET' || req.method === 'HEAD') return undefined;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return chunks.length ? Buffer.concat(chunks) : undefined;
};

export default async function handler(req, res) {
  if (!BACKEND_BASE_URL) {
    return res.status(500).json({ message: 'BACKEND_BASE_URL is not configured on this deployment' });
  }

  // `path` comes from the rewrite; every other query param is the caller's own.
  const { path: raw, ...forwarded } = req.query ?? {};
  const path = Array.isArray(raw) ? raw.join('/') : (raw ?? '');

  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(forwarded)) {
    for (const v of Array.isArray(value) ? value : [value]) params.append(name, v);
  }
  const query = params.toString() ? `?${params}` : '';

  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (!STRIP.has(name.toLowerCase()) && value !== undefined) {
      headers[name] = Array.isArray(value) ? value.join(', ') : value;
    }
  }

  try {
    const upstream = await fetch(`${BACKEND_BASE_URL}/${path}${query}`, {
      method: req.method,
      headers,
      body: await rawBody(req),
    });

    upstream.headers.forEach((value, name) => {
      if (!STRIP.has(name.toLowerCase())) res.setHeader(name, value);
    });

    res.status(upstream.status);
    return res.send(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    return res.status(502).json({ message: 'Upstream request failed' });
  }
}
