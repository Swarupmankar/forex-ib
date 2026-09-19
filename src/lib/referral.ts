/** Build the same registration route for links, invitations and QR codes. */
export const referralLink = (base: string | undefined, code: string): string => {
  if (!base || !code.trim()) return '';
  try {
    const url = new URL(`${base.replace(/\/+$/, '')}/auth`);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    url.searchParams.set('ref', code);
    return url.href;
  } catch { return ''; }
};

export const validReferralLink = (value: string): boolean => {
  try {
    const url = new URL(value);
    return (url.protocol === 'https:' || url.protocol === 'http:') && !!url.searchParams.get('ref')?.trim();
  } catch { return false; }
};

export const trackedReferralLink = (base: string | undefined, path: string, code: string, source: string): string => {
  if (!base || !code.trim()) return '';
  try {
    const url = new URL(path, base);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return '';
    url.searchParams.set('ref', code);
    url.searchParams.set('utm_source', source);
    return url.href;
  } catch { return ''; }
};
