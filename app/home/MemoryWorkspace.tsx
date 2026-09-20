'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { demoMemories } from '@/lib/demo-data';
import { blockedPageReason } from '@/lib/privacy-filter';
import type { SearchableMemory } from '@/lib/memory-search';
import MemorySearch from './MemorySearch';

const examples = [
  ...demoMemories.filter(item => ['mcp-guide', 'macbook-air', 'macbook-specs', 'mcp-sdk', 'react-guide', 'career-video'].includes(item.id)).map(item => ({ id: item.id, title: item.title, url: item.url })),
  { id: 'private-bank', title: '은행 계좌 조회', url: 'https://bank.example.com/account' },
  { id: 'private-mail', title: '메일 받은편지함', url: 'https://mail.example.com/inbox' },
  { id: 'private-health', title: '건강검진 결과', url: 'https://health.example.com/results' },
];

export default function MemoryWorkspace({ memories: accountMemories, loadError = false, logoutError = false, initialImport = false, preview = false }: { preview?: boolean; memories: SearchableMemory[]; loadError?: boolean; logoutError?: boolean; initialImport?: boolean }) {
  const router = useRouter();
  const [previewMemories, setPreviewMemories] = useState<SearchableMemory[]>([]);
  const memories = preview ? previewMemories : accountMemories;
  const [review, setReview] = useState(initialImport);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, 'saved' | 'failed'>>({});
  const [message, setMessage] = useState('');
  const locked = useRef(false);
  const available = examples.filter(item => !blockedPageReason(item.url, item.title));
  const [selected, setSelected] = useState(available.map(item => item.id));
  const pending = available.filter(item => selected.includes(item.id) && results[item.id] !== 'saved' && !memories.some(memory => memory.url === item.url));

  async function importMemories() {
    if (locked.current || loadError || !pending.length) return;
    locked.current = true; setSaving(true); setProgress(0); setMessage('');
    let success = 0, failed = 0;
    try {
      for (const item of pending) {
        let ok = false;
        try {
          if (preview) {
            const sample = demoMemories.find(memory => memory.id === item.id)!;
            setPreviewMemories(values => [...values, { id: sample.id, title: sample.title, url: sample.url, summary: sample.summary, category: sample.category, tags: sample.tags, created_at: sample.savedAt }]);
            ok = true;
          } else {
          const response = await fetch('/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url, title: item.title }) });
          ok = response.ok;
          }
        } catch { /* Network ambiguity is reported; no automatic retry. */ }
        if (ok) success++; else failed++;
        setResults(values => ({ ...values, [item.id]: ok ? 'saved' : 'failed' }));
        setProgress(value => value + 1);
      }
      setMessage(`${success}개 저장 완료${failed ? ` · ${failed}개 저장 확인 실패. 내 기억을 먼저 확인한 뒤 재시도해 주세요.` : ' · 아래에서 기억나는 단서로 검색해 보세요.'}`);
      if (!preview) router.refresh();
      if (!failed) setReview(false);
    } finally { locked.current = false; setSaving(false); }
  }

  return <div className="demo-shell workspace-shell">
    <aside className="sidebar"><Link className="brand" href="/"><span>◉</span>Trace</Link><div className="sidebar-caption">흩어진 방문을 다시 찾을 기억으로</div><nav aria-label="내 기억 메뉴"><button className={!review ? 'active' : ''} disabled={saving} onClick={() => setReview(false)}>내 기억 <span>{memories.length}</span></button><button className={review ? 'active' : ''} disabled={saving} onClick={() => setReview(true)}>한 번에 가져오기</button><Link href="/demo">서비스 안내 체험</Link></nav><div className="demo-note"><strong>나만의 기억 공간</strong><p>{preview ? "서버 저장 없는 미리보기입니다." : "저장한 기억은 계정에 남아요. 브라우저 기록을 지워도 Trace에서는 별도로 삭제해야 합니다."}</p></div>{!preview && <form action="/auth/sign-out" method="post"><button className="ghost-button" disabled={saving}>로그아웃</button></form>}</aside>
    <main className="demo-main experience-main">
      <header className="experience-topbar"><Link className="brand" href="/">◉ Trace</Link><span className="experience-badge live">{preview ? "로그인 후 화면 미리보기 · 서버 저장 없음" : "내 계정 · 실제 저장"}</span></header>
      {preview && <p className="account-notice">로그인 후 흐름을 예시로 체험하는 화면입니다. 서버 저장·AI 호출 없이 이 화면 안에서만 작동하며 새로고침하면 초기화됩니다.</p>}
      <section className="workspace-welcome"><span className="eyebrow">YOUR BROWSING, REMEMBERED</span><h1>지나간 페이지를,<br/>다시 찾을 수 있는 기억으로.</h1><p>페이지들을 한 번에 모으고, 정확한 제목 대신 기억나는 단서로 찾아보세요.</p><div className="workspace-flow"><span>01 방문 기록 가져오기</span><b>→</b><span>02 민감 페이지 제외</span><b>→</b><span>03 AI로 다시 찾기</span></div></section>
      {logoutError && <p role="alert">로그아웃하지 못했어요. 다시 시도해 주세요.</p>}
      <details className="privacy-disclosure"><summary>어떤 정보를 저장하고, 무엇을 제외하나요?</summary><p>이번 제출 버전은 <strong>예시 방문 기록</strong>으로 가져오기 흐름을 체험합니다. 실제 Chrome 방문 기록 접근은 연결 전입니다. 예시라는 표시 없이 방문 기록을 읽거나 가져오지 않습니다.</p><p>은행·결제·메일·로그인·건강 관련 문자열과 개인정보·인증 정보 패턴을 검사합니다. 제외된 항목은 선택할 수 없으며 서버에서도 재검사합니다. 문자열 규칙만으로 모든 민감 페이지를 탐지하지는 못합니다.</p><p>선택한 공개 페이지의 제목·주소가 서버에 저장되고 AI 정리에 사용됩니다. 예시 방문 날짜나 본문은 저장하지 않아요. 검색 시 입력한 문장을 Gemini에 보내 키워드를 해석하며, 전체 기억 목록을 보내지 않습니다. 비밀번호·인증번호는 입력하지 마세요.</p></details>
      <section className="import-launch"><div><span className="eyebrow">방문 기록 가져오기 · 체험</span><h2>{memories.length ? '새로운 기억을 이어서 모아볼까요?' : '첫 기억을 한 번에 불러오세요.'}</h2><p>공개 페이지 예시 6개와 제외 대상 3개로 흐름을 체험합니다.<br/>{preview ? "미리보기에서는 화면 안에만 기억을 추가합니다." : "검토 후 저장하면 내 계정에 실제로 남습니다."}</p></div><button className="primary-button" disabled={saving} onClick={() => setReview(value => !value)}>{review ? '검토 목록 접기' : '예시 방문 기록 불러오기'}</button></section>
      {review && <section className="history-review" aria-label="예시 방문 기록 검토"><div className="workspace-heading"><div><span className="eyebrow">불러오기 → 검토 → 기억에 추가</span><h2>민감 페이지 3개를 제외했어요.</h2><p>이미 저장된 주소는 이번 가져오기에서 건너뜁니다.</p></div><span className="selection-count">{pending.length}개 저장 예정</span></div><div className="history-rows">{examples.map(item => { const reason = blockedPageReason(item.url, item.title); const saved = results[item.id] === 'saved' || memories.some(memory => memory.url === item.url); return <label className={`history-row ${reason ? 'blocked' : ''}`} key={item.id}><input type="checkbox" checked={!reason && (saved || selected.includes(item.id))} disabled={Boolean(reason) || saved || saving} onChange={event => setSelected(values => event.target.checked ? [...values, item.id] : values.filter(id => id !== item.id))}/><span><strong>{item.title}</strong><small>{new URL(item.url).hostname}</small></span><b>{reason ? '민감 · 제외' : saved ? '저장됨' : results[item.id] === 'failed' ? '저장 확인 필요' : '공개 페이지'}</b></label>; })}</div><div className="collection-action"><p>선택한 공개 예시만 저장합니다. 실제 방문 기록을 수집하지 않습니다.</p><button className="primary-button" disabled={saving || !pending.length || loadError} onClick={importMemories}>{saving ? `저장 중 · ${progress}개 처리` : `선택한 ${pending.length}개 ${preview ? "가져오기 체험" : "내 계정에 저장"}`}</button></div></section>}
      {message && <p className="account-notice" role="status">{message}</p>}
      {loadError ? <p role="alert">기억을 불러오지 못했어요. 중복 저장을 막기 위해 가져오기도 잠시 멈췄습니다. 새로고침 후 확인해 주세요.</p> : memories.length ? <section className="personal-search-section"><div className="workspace-heading"><div><span className="eyebrow">SEARCH YOUR MEMORY</span><h2>어떤 페이지가 떠오르나요?</h2><p>최근 저장한 50개에서 검색합니다. AI가 문장의 단서를 해석하고 저장된 내용에서 후보를 찾습니다.</p></div></div><MemorySearch memories={memories} demo={preview} /></section> : <section className="empty-state workspace-empty"><span aria-hidden="true">⌕</span><h2>아직 가져온 기억이 없어요.</h2><p>위에서 예시 방문 기록을 불러와 저장하면,<br/>“AI와 도구를 연결하는 글” 같은 단서로 검색할 수 있어요.</p><div className="example-queries"><span>“맥북 사양을 봤던 페이지”</span><span>“MCP 설명했던 글”</span></div></section>}
    </main>
  </div>;
}
