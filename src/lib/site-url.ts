// Absolute URL for a site path that respects Astro's `base` (the /journal/ build).
// siteUrl('/beauty/x/', Astro.site) -> https://blog.koursea.com/beauty/x/   (normal build)
//                                   -> https://www.koursea.com/journal/beauty/x/   (JOURNAL_BASE=1 build)
// Already-absolute URLs (http/https) are returned unchanged.
export function siteUrl(path: string, site: URL | string | undefined): URL {
  const base = String(import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
  if (/^https?:\/\//i.test(path)) return new URL(path);
  const root = new URL(String(site));
  if (!path.startsWith('/')) return new URL(path, root);
  if (base && (path === base || path.startsWith(base + '/'))) return new URL(path, root);
  return new URL(base + path, root);
}
