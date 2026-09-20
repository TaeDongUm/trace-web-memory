// Conservative string rules for the submission prototype, not complete sensitive-page detection.
export const BLOCKED_PAGE_WORDS = ['bank', 'banking', 'payment', 'checkout', 'mail', 'login', 'signin', 'account', 'health', 'medical', 'patient', '은행', '결제', '메일', '로그인', '건강', '진료', '검진', '환자'];
export function hasSensitiveText(text: string): boolean {
  return /(?:access[_-]?token|refresh[_-]?token|api[_-]?key|password|passwd|secret|authorization|bearer)\s*[=: ]|[\w.+-]+@[\w.-]+\.[a-z]{2,}|\b01[016789][- ]?\d{3,4}[- ]?\d{4}\b|\b\d{6}[- ]?[1-4]\d{6}\b/i.test(text);
}
export function blockedPageReason(url: string, title = ''): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) return '공개 HTTPS 주소가 아닙니다';
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname.includes('.') || hostname.includes(':') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(hostname)) return '내부 주소는 제외합니다';
    const decoded = decodeURIComponent(url).toLowerCase();
    const text = `${decoded} ${title.toLowerCase()}`;
    if (hasSensitiveText(text) || /[?&#](token|code|session|sid|auth|key)=/i.test(decoded)) return '개인정보 또는 인증 정보가 의심됩니다';
    if (BLOCKED_PAGE_WORDS.some(word => text.includes(word))) return '민감 페이지 문자열 규칙에 해당합니다';
    return null;
  } catch { return '주소를 확인할 수 없습니다'; }
}
