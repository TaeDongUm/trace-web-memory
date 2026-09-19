"use client";
import { type FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { demoMemories, DEMO_TODAY, exampleQueries, type Category } from "@/lib/demo-data";
import { relatedMemories, searchMemories } from "@/lib/demo-search";
import { CompactMemoryCard, MemoryCard } from "./MemoryCard";
export default function SearchDemo() {
  const [input, setInput] = useState(exampleQueries[0]), [query, setQuery] = useState(exampleQueries[0]);
  const [category, setCategory] = useState<Category | "전체">("전체"), [selectedId, setSelectedId] = useState<string | null>(null);
  const hits = useMemo(() => searchMemories(demoMemories, query).filter(hit => category === "전체" || hit.memory.category === category), [query, category]);
  const selected = hits.find(hit => hit.memory.id === selectedId) ?? hits[0];
  const related = selected ? relatedMemories(demoMemories, selected.memory) : [];
  function runSearch(value: string) { setInput(value); setQuery(value.trim()); setSelectedId(null); setCategory("전체"); }
  function submit(event: FormEvent) { event.preventDefault(); runSearch(input); }
  const categories: (Category | "전체")[] = ["전체", "쇼핑", "유튜브", "아티클", "개발"];
  return <div className="demo-shell">
    <aside className="sidebar"><Link className="brand" href="/"><span>◉</span>Trace</Link><div className="sidebar-caption">나의 기억 공간</div>
      <nav aria-label="기억 탐색"><button onClick={() => runSearch("")}>모든 기억 보기 <span>{demoMemories.length}</span></button><Link href="/">서비스 소개 ↗</Link></nav>
      <div className="demo-note"><strong>로그인 없는 데모</strong><p>준비된 공개 콘텐츠를 검색해보세요. 개인 브라우징 기록은 수집하지 않습니다.</p></div>
    </aside>
    <main className="demo-main"><div className="demo-mobile-brand"><Link className="brand" href="/">◉ Trace</Link><span>데모 체험</span></div>
      <header className="search-intro"><span className="eyebrow">기억을 다시 찾는 순간</span><h1>분명 봤는데, 어디서 봤지?</h1><p>정확한 제목 대신, 기억나는 단서를 적어보세요.</p></header>
      <form className="demo-search" onSubmit={submit} role="search"><label className="sr-only" htmlFor="memory-query">Trace 검색</label><span aria-hidden="true">⌕</span><input id="memory-query" value={input} maxLength={200} onChange={e => setInput(e.target.value)} placeholder="전에 봤던 검정색 러닝화" /><button type="submit" aria-label="검색">→</button></form>
      <div className="example-queries" aria-label="검색 예시">{exampleQueries.map(example => <button key={example} onClick={() => runSearch(example)}>{example}</button>)}</div>
      <div className="demo-disclosure">예시 기억 {demoMemories.length}개 · 저장일은 가상 기록 ({DEMO_TODAY} 기준)<details><summary>데모 안내</summary><p>외부 AI 호출 없이 키워드·동의어·가격·날짜 단서로 검색합니다. 공개 링크의 현재 정보는 데모와 다를 수 있습니다. “최근/며칠 전”은 기준일로부터 7일 이내, “지난주”는 7~13일 전, “약 20만원”은 ±20%로 해석합니다. “20만원대”는 20만원 이상 30만원 미만입니다.</p></details></div>
      <nav className="category-tabs" aria-label="콘텐츠 유형">{categories.map(item => <button key={item} aria-pressed={category === item} onClick={() => { setCategory(item); setSelectedId(null); }}>{item}</button>)}</nav>
      <section className="result-heading" aria-live="polite" aria-atomic="true"><h2>{query ? `“${query}”` : "저장된 모든 기억"}</h2><p>{hits.length ? `${hits.length}개의 ${query ? "검색 후보" : "기억"}` : "일치하는 기억이 없어요."}</p></section>
      {!selected ? <section className="empty-state"><span aria-hidden="true">⌕</span><h2>다른 단서로 찾아볼까요?</h2><p>현재 데모에 없는 내용일 수 있어요. 위 검색 예시를 선택하거나 저장된 기억을 둘러보세요.</p><button className="secondary-button" onClick={() => runSearch("")}>모든 기억 보기</button></section> : <>
        <section className="primary-result-grid"><MemoryCard memory={selected.memory} /><aside className="match-card"><span className="match-label">{!query ? "선택한 기억" : selected.missing.length ? "일부 단서가 일치하는 후보" : "입력한 단서가 일치해요"}</span><h2>왜 이 기억을 찾았나요?</h2><ul>{selected.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>{selected.missing.length > 0 && <div className="missing-clues"><strong>일치하지 않거나 확인할 수 없는 단서</strong><p>{selected.missing.join(" · ")}</p></div>}<a className="primary-button" href={selected.memory.url} target="_blank" rel="noopener noreferrer">원본 페이지 열기 ↗<span className="sr-only"> · {selected.memory.title} · 새 탭</span></a></aside></section>
        {hits.length > 1 && <section className="related-section"><h2>다른 검색 후보</h2><div className="candidate-list">{hits.filter(hit => hit.memory.id !== selected.memory.id).map(hit => <button key={hit.memory.id} className="candidate" onClick={() => setSelectedId(hit.memory.id)}><span><strong>{hit.memory.title}</strong><small>{hit.memory.source} · {hit.memory.savedAt}</small></span><span>{hit.missing.length ? "일부 일치" : "단서 일치"} →</span></button>)}</div></section>}
        {related.length > 0 && <section className="related-section"><h2>같은 주제로 저장한 기억</h2><p className="muted">예시 데이터에 지정한 주제별 묶음입니다. 실제 방문 순서는 아닙니다.</p><div className="related-list">{related.map(memory => <CompactMemoryCard key={memory.id} memory={memory} />)}</div></section>}
      </>}
      <footer className="demo-footer">개인 기억 저장은 준비 중입니다. <Link href="/login">내 기억 공간으로 →</Link></footer>
    </main>
  </div>;
}
