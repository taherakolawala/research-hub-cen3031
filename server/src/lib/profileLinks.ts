const MAX_LINKS = 5;
const LABEL_MAX = 80;

export type ProfileLinkRow = { label: string; url: string };

export function parseProfileLinks(input: unknown): { ok: true; value: ProfileLinkRow[] } | { ok: false; error: string } {
  if (input === undefined) {
    return { ok: true, value: [] };
  }
  if (input === null) {
    return { ok: true, value: [] };
  }
  if (!Array.isArray(input)) {
    return { ok: false, error: 'profileLinks must be an array' };
  }
  if (input.length > MAX_LINKS) {
    return { ok: false, error: `At most ${MAX_LINKS} links allowed` };
  }

  const out: ProfileLinkRow[] = [];
  for (const item of input) {
    if (!item || typeof item !== 'object') {
      return { ok: false, error: 'Each link must be an object with label and url' };
    }
    const raw = item as { label?: unknown; url?: unknown };
    const label = typeof raw.label === 'string' ? raw.label.trim() : '';
    const urlRaw = typeof raw.url === 'string' ? raw.url.trim() : '';
    if (!label || !urlRaw) {
      return { ok: false, error: 'Each link needs a non-empty label and URL' };
    }
    if (label.length > LABEL_MAX) {
      return { ok: false, error: `Link label too long (max ${LABEL_MAX} characters)` };
    }
    let u: URL;
    try {
      u = new URL(urlRaw);
    } catch {
      return { ok: false, error: 'Invalid URL' };
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { ok: false, error: 'URL must use http:// or https://' };
    }
    out.push({ label, url: u.href });
  }
  return { ok: true, value: out };
}

export function rowProfileLinks(row: { profile_links?: unknown }): ProfileLinkRow[] {
  const raw = row.profile_links;
  if (raw == null) return [];
  if (!Array.isArray(raw)) return [];
  const parsed = parseProfileLinks(raw);
  return parsed.ok ? parsed.value : [];
}
