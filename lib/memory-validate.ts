export type MemoryInput = {
  url: string;
  title: string;
  summary?: string;
  content?: string;
  image_url?: string;
  source?: string;
  category?: string;
  tags?: string[];
  visited_at?: string;
  metadata?: Record<string, unknown>;
};

const BLOCKED_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'];
const PRIVATE_IP_PATTERN = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/;

const isPublicHttpsUrl = (value: string, maxLength: number) => {
  if (value.length < 1 || value.length > maxLength || !value.startsWith('https://')) return false;
  try {
    const { hostname } = new URL(value);
    if (BLOCKED_HOSTNAMES.includes(hostname) || PRIVATE_IP_PATTERN.test(hostname)) return false;
    return true;
  } catch { return false; }
};

const fallbackTitle = (url: string) => {
  try {
    const { hostname, pathname } = new URL(url);
    const title = `${hostname}${pathname === '/' ? '' : pathname}`;
    return title.slice(0, 500);
  } catch { return url.slice(0, 500); }
};

const byteLength = (value: string) => Buffer.byteLength(value, 'utf8');

export function validateMemoryInput(body: unknown): { value: MemoryInput } | { error: string } {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return { error: 'invalid_body' };
  const input = body as Record<string, unknown>;

  const url = typeof input.url === 'string' ? input.url.trim() : '';
  if (!isPublicHttpsUrl(url, 2048)) return { error: 'invalid_url' };

  const rawTitle = typeof input.title === 'string' ? input.title.trim() : '';
  const title = rawTitle.length > 0 ? rawTitle : fallbackTitle(url);
  if (title.length < 1 || title.length > 500) return { error: 'invalid_title' };

  const value: MemoryInput = { url, title };

  if (input.summary !== undefined) {
    if (typeof input.summary !== 'string' || input.summary.length > 4000) return { error: 'invalid_summary' };
    if (input.summary.length > 0) value.summary = input.summary;
  }
  if (input.content !== undefined) {
    if (typeof input.content !== 'string' || input.content.length > 12000) return { error: 'invalid_content' };
    if (input.content.length > 0) value.content = input.content;
  }
  if (input.image_url !== undefined && input.image_url !== '') {
    const imageUrl = typeof input.image_url === 'string' ? input.image_url.trim() : '';
    if (!isPublicHttpsUrl(imageUrl, 2048)) return { error: 'invalid_image_url' };
    value.image_url = imageUrl;
  }
  if (input.source !== undefined) {
    if (typeof input.source !== 'string' || input.source.length > 255) return { error: 'invalid_source' };
    if (input.source.length > 0) value.source = input.source;
  }
  if (input.category !== undefined) {
    if (typeof input.category !== 'string' || input.category.length > 50) return { error: 'invalid_category' };
    if (input.category.length > 0) value.category = input.category;
  }
  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags) || input.tags.length > 30 || !input.tags.every((tag) => typeof tag === 'string')) return { error: 'invalid_tags' };
    if (byteLength(JSON.stringify(input.tags)) > 4000) return { error: 'invalid_tags' };
    value.tags = input.tags as string[];
  }
  if (input.visited_at !== undefined && input.visited_at !== '') {
    if (typeof input.visited_at !== 'string' || Number.isNaN(Date.parse(input.visited_at))) return { error: 'invalid_visited_at' };
    value.visited_at = input.visited_at;
  }
  if (input.metadata !== undefined) {
    if (typeof input.metadata !== 'object' || input.metadata === null || Array.isArray(input.metadata)) return { error: 'invalid_metadata' };
    if (byteLength(JSON.stringify(input.metadata)) > 8000) return { error: 'invalid_metadata' };
    value.metadata = input.metadata as Record<string, unknown>;
  }

  return { value };
}
