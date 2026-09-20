// Manifest V3 service worker. activeTab 권한만 사용하며, 사용자가 아이콘을
// 클릭한 순간의 탭 정보만 읽는다 — 브라우저 기록이나 다른 탭에는 접근하지 않는다.
const SITE_URL = 'https://trace-web-memory.vercel.app';

function flashBadge(tabId, text, color) {
  chrome.action.setBadgeText({ text, tabId });
  chrome.action.setBadgeBackgroundColor({ color, tabId });
  setTimeout(() => chrome.action.setBadgeText({ text: '', tabId }), 2000);
}

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  // 확장 프로그램 내부 페이지, chrome://, 로컬 파일 등은 저장 대상이 아니다.
  if (!tab.url || !tab.url.startsWith('https://')) {
    flashBadge(tab.id, '차단', '#b3261e');
    return;
  }
  const params = new URLSearchParams({ url: tab.url, title: tab.title || '' });
  chrome.tabs.create({ url: `${SITE_URL}/save?${params.toString()}` });
});
