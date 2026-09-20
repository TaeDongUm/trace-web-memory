'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { demoMemories } from '@/lib/demo-data';
import type { SearchableMemory } from '@/lib/memory-search';
import SearchDemo from './SearchDemo';
import MemorySearch from '../home/MemorySearch';

const steps = [
  { label: '기억 모으기', title: '다시 찾고 싶은 페이지만 골라보세요.', body: '운동화, 개발 문서, 노트북… 흩어진 페이지 중 기억할 카드를 선택해 보세요. 이 목록은 실제 방문 기록이 아닌 공개 페이지 예시입니다.', action: '선택한 기억 정리하기' },
  { label: '의미로 정리', title: '주소 대신, 기억할 만한 단서로.', body: '제목·요약·태그가 붙으면 정확한 제목을 몰라도 찾을 수 있어요. 여기서는 미리 준비된 정리 결과를 보여드립니다. 실제 저장에서는 AI가 제공된 정보를 정리합니다.', action: '기억의 단서로 찾아보기' },
  { label: '단서로 찾기', title: '정확한 이름을 몰라도 괜찮아요.', body: '“MCP 설명했던 글”처럼 기억나는 단서를 입력하거나 검색 예시를 눌러보세요. 어떤 조건이 맞고, 어떤 조건은 다른지 확인할 수 있어요.', action: '원본으로 돌아가는 방법' },
  { label: '원본으로 돌아가기', title: '찾은 기억에서, 그 페이지로.', body: '검색 결과의 “원본 페이지 열기”를 누르면 실제 공개 페이지가 새 탭에서 열립니다. 관련 기억도 함께 살펴보세요.', action: '다시 체험하기' },
];

export default function TraceExperience({ authenticated = false, memories = [], loadError = false, logoutError = false, initialCollect = false }: {
  authenticated?: boolean; memories?: SearchableMemory[]; loadError?: boolean; logoutError?: boolean; initialCollect?: boolean;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<'demo' | 'personal'>(authenticated && memories.length > 0 && !initialCollect ? 'personal' : 'demo');
  const [guide, setGuide] = useState(true);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(['nike-pegasus-42', 'mcp-guide', 'macbook-air']);
  const [results, setResults] = useState<Record<string, 'saved' | 'failed'>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const saveLock = useRef(false);
  const chosen = demoMemories.filter(item => selected.includes(item.id));
  const candidates = chosen.filter(item => results[item.id] !== 'saved' && !memories.some(memory => memory.url === item.url));

  function selectStep(index: number) { if (saving) return; setMode('demo'); setStep(index); }
  function toggle(id: string) { setSelected(values => values.includes(id) ? values.filter(value => value !== id) : [...values, id]); }

  async function saveExamples() {
    if (!authenticated || saveLock.current || !candidates.length) return;
    saveLock.current = true; setSaving(true); setMessage('선택한 공개 페이지를 내 계정에 저장하고 있어요.');
    let success = 0, failure = 0;
    try {
      for (const item of candidates) {
        let ok = false;
        try {
          // Only selected public URLs/titles are sent. Fictional dates, prices and summaries stay in the demo.
          const response = await fetch('/api/memories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: item.url, title: item.title }) });
          ok = response.ok;
        } catch { /* Report each failure; do not silently retry a possibly completed write. */ }
        if (ok) success++; else failure++;
        setResults(values => ({ ...values, [item.id]: ok ? 'saved' : 'failed' }));
      }
      setMessage(`${success}개 저장 완료${failure ? ` · ${failure}개는 저장 여부를 확인하지 못했어요. 내 기억을 확인한 뒤 다시 시도해 주세요.` : ' · 내 기억 탭에서 실제 정리 결과를 확인하세요.'}`);
      router.refresh();
    } finally { saveLock.current = false; setSaving(false); }
  }

  return <div className="demo-shell experience-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span>◉</span>Trace</Link>
      <div className="sidebar-caption">흩어진 페이지를 하나의 기억으로</div>
      <nav aria-label="기억 공간">
        <button className={mode === 'demo' ? 'active' : ''} onClick={() => setMode('demo')} disabled={saving}>서비스 체험 <span>DEMO</span></button>
        {authenticated && <button className={mode === 'personal' ? 'active' : ''} onClick={() => setMode('personal')} disabled={saving}>내 기억 <span>{memories.length}</span></button>}
      </nav>
      <div className="journey-sidebar"><span className="sidebar-caption">기억이 이어지는 과정</span>{steps.map((item, index) => <button key={item.label} onClick={() => selectStep(index)} disabled={saving} aria-current={mode === 'demo' && step === index ? 'step' : undefined}><b>0{index + 1}</b>{item.label}</button>)}</div>
      <div className="demo-note"><strong>{authenticated ? '내 기억과 예시는 별도예요' : '설치도, 로그인도 필요 없이'}</strong><p>{authenticated ? '체험만으로는 계정에 저장되지 않아요. 직접 저장을 선택한 페이지만 남습니다.' : '공개 페이지 예시로 Trace의 전체 흐름을 경험하세요. 방문 기록을 읽지 않습니다.'}</p></div>
      {authenticated ? <form action="/auth/sign-out" method="post"><button className="ghost-button">로그아웃</button></form> : <Link className="secondary-button" href="/login">내 기억 공간 시작하기</Link>}
    </aside>
    <main className="demo-main experience-main">
      <header className="experience-topbar"><Link className="brand" href="/">◉ Trace</Link><div><span className={`experience-badge ${mode === 'personal' ? 'live' : ''}`}>{mode === 'personal' ? '내 계정 · 실제 기억' : '로그인 없이 가능한 예시 체험'}</span><button className="guide-toggle" aria-expanded={guide} aria-controls="trace-guide" onClick={() => setGuide(value => !value)}>사용 안내 <b>{guide ? 'ON' : 'OFF'}</b></button></div></header>
      {authenticated && <div className="experience-modes" aria-label="데이터 선택"><button aria-pressed={mode === 'demo'} onClick={() => setMode('demo')} disabled={saving}>예시로 전체 흐름 체험</button><button aria-pressed={mode === 'personal'} onClick={() => setMode('personal')} disabled={saving}>내 기억 · {memories.length}</button></div>}
      {logoutError && <p role="alert">로그아웃하지 못했어요. 다시 시도해 주세요.</p>}
      {guide && <section className="journey-guide" id="trace-guide" aria-label="Trace 사용 안내">
        <div className="guide-heading"><span>TRACE, IN 2 MINUTES</span><button className="inline-action" onClick={() => setGuide(false)}>안내 숨기기</button></div>
        <h1>{mode === 'personal' ? '당신이 남긴 기억에서 다시 찾아보세요.' : steps[step].title}</h1>
        <p>{mode === 'personal' ? '이 탭에는 내 계정에 실제 저장된 기억만 표시됩니다. 검색·원본 열기·삭제를 사용할 수 있어요. 아직 비어 있다면 예시 카드를 골라 실제 저장을 체험해 보세요.' : steps[step].body}</p>
        <div className="journey-progress" aria-label="체험 단계">{steps.map((item, index) => <button key={item.label} aria-current={mode === 'demo' && step === index ? 'step' : undefined} disabled={saving} onClick={() => selectStep(index)}><span>{index + 1}</span>{item.label}</button>)}</div>
        {mode === 'demo' && <div className="guide-controls"><button className="ghost-button" disabled={step === 0 || saving} onClick={() => selectStep(step - 1)}>이전</button><span>{step + 1} / 4</span><button className="primary-button" disabled={saving || (step < 2 && !chosen.length)} onClick={() => selectStep(step === 3 ? 0 : step + 1)}>{steps[step].action} →</button></div>}
      </section>}

      {mode === 'personal' ? <>
        <div className="workspace-heading"><div><span className="eyebrow">MY MEMORIES</span><h2>기억해 둔 페이지</h2><p>최근 저장한 50개 안에서 기억나는 단서로 찾아보세요.</p></div><button className="primary-button" onClick={() => selectStep(0)}>기억 추가 체험</button></div>
        {loadError ? <p role="alert">기억을 불러오지 못했어요. 새로고침 후 다시 확인해 주세요.</p> : <MemorySearch memories={memories} />}
        <details className="extension-guide"><summary>지금 보는 페이지는 어떻게 기억하나요?</summary><p>Chrome용 Trace 확장 프로그램으로 현재 페이지의 제목과 주소를 저장할 수 있어요. 자동 방문 기록 수집은 아직 지원하지 않습니다.</p><p>개발자 모드에서 프로젝트의 extension 폴더를 불러오는 설치가 필요합니다. 민감 페이지 차단은 보완 중이므로 공개 문서·게시물로만 시연해 주세요.</p></details>
      </> : <>
        <div className="experience-disclosure"><span>예시 데이터</span> 실제 방문 기록을 읽지 않아요. 선택·정리·검색은 이 화면에서 체험하며 새로고침하면 초기화됩니다.</div>
        {step === 0 && <section aria-label="기억할 페이지 선택">
          <div className="workspace-heading"><div><span className="eyebrow">01 · COLLECT</span><h2>오늘의 탐색을 기억으로</h2><p>주소를 붙여넣지 말고, 기억할 페이지를 골라보세요.</p></div><span className="selection-count">{chosen.length}개 선택</span></div>
          <div className="collect-grid">{demoMemories.map(item => <button key={item.id} className={`collect-card ${selected.includes(item.id) ? 'selected' : ''}`} aria-pressed={selected.includes(item.id)} onClick={() => toggle(item.id)} disabled={saving}><div className={`collect-art visual-${item.accent}`}><span>{item.category === '쇼핑' ? 'RUN / 42' : item.category === '유튜브' ? 'PLAY ▶' : item.topic === 'macbook' ? 'MacBook' : item.tags[0]}</span><b aria-hidden="true">{selected.includes(item.id) ? '✓' : '+'}</b></div><div className="collect-copy"><small>{item.source} · {item.category}</small><strong>{item.title}</strong><span>{item.tags.slice(0, 3).join(' · ')}</span></div></button>)}</div>
          <div className="collection-action"><p>선택한 페이지로 체험을 이어갑니다. 계정에는 저장하지 않아요.</p><button className="primary-button" disabled={!chosen.length} onClick={() => selectStep(1)}>선택한 {chosen.length}개 정리해 보기 →</button></div>
        </section>}
        {step === 1 && <section aria-label="기억 정리 미리보기"><div className="workspace-heading"><div><span className="eyebrow">02 · UNDERSTAND</span><h2>한 줄의 주소가, 다시 찾을 단서로</h2><p>아래 요약·태그는 준비된 예시입니다. 이 단계에서 AI를 호출하지 않습니다.</p></div></div>
          <div className="structure-list">{chosen.map(item => <article className="structure-card" key={item.id}><div><small>{item.source}</small><h3>{item.title}</h3><span className="structure-arrow">기억의 단서로 정리 →</span></div><div><span className="eyebrow">{item.category}</span><p>{item.summary}</p><div className="tag-row">{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></div></article>)}</div>
          {!chosen.length && <p>먼저 기억할 페이지를 선택해 주세요.</p>}
          <div className="collection-action"><p>단어가 다르더라도, 남아 있는 단서로 다시 찾아보세요.</p><button className="primary-button" disabled={!chosen.length} onClick={() => selectStep(2)}>선택한 기억 검색하기 →</button></div>
        </section>}
        {step >= 2 && <SearchDemo embedded memories={chosen} />}
        {authenticated && <section className="real-save-panel" aria-label="선택한 예시 실제 저장"><div><span className="eyebrow">여기서부터 실제 저장</span><h2>이 페이지를 내 기억으로 남길까요?</h2><p>선택한 공개 페이지의 제목·주소를 내 계정에 저장합니다. 설정된 AI로 정리를 시도하며, 실패하면 제목·주소만 저장합니다. 예시 날짜·가격·요약은 복사하지 않아요.</p></div><button className="primary-button" onClick={saveExamples} disabled={saving || !candidates.length || loadError}>{saving ? '실제 저장 중…' : candidates.length ? `선택한 예시 ${candidates.length}개 내 계정에 저장` : '선택한 페이지가 이미 저장되어 있어요'}</button>{loadError && <p role="alert">내 기억을 불러오지 못해 중복 저장을 막았습니다. 새로고침 후 시도해 주세요.</p>}{message && <p role="status">{message}</p>}{Object.entries(results).filter(([, result]) => result === 'failed').map(([id]) => <p key={id} className="save-error">저장 확인 필요: {demoMemories.find(item => item.id === id)?.title}</p>)}{Object.values(results).includes('saved') && <button className="secondary-button" onClick={() => setMode('personal')} disabled={saving}>내 실제 기억 확인하기 →</button>}</section>}
      </>}
      <footer className="experience-footer">직접 고른 기억만 남기는 Trace · 전체 방문 기록 자동 수집은 지원하지 않습니다.{!authenticated && <Link href="/login">Google로 내 기억 공간 시작하기 →</Link>}</footer>
    </main>
  </div>;
}
