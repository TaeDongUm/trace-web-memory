"use client";

import { FormEvent, useMemo, useState } from "react";
import { demoMemories } from "@/lib/demo-data";
import { CompactMemoryCard, MemoryCard } from "./MemoryCard";

const defaultQuery = "저번에 본 20만원대 검은 운동화";

export default function SearchDemo() {
  const [input, setInput] = useState(defaultQuery);
  const [query, setQuery] = useState(defaultQuery);

  const primary = demoMemories[0];
  const related = useMemo(() => demoMemories.slice(1, 3), []);

  function submit(e: FormEvent) {
    e.preventDefault();
    setQuery(input.trim() || defaultQuery);
  }

  return (
    <div className="demo-shell">
      <aside className="sidebar">
        <a className="brand" href="/"><span>◉</span>Trace</a>
        <nav>
          <a className="active">⌂ 홈</a>
          <a>⌕ 검색</a>
          <a>◷ 최근 본 것</a>
          <a>▣ 쇼핑</a>
          <a>▶ 유튜브</a>
          <a>▤ 아티클</a>
          <a>⌘ 개발/기술</a>
          <a>☆ 저장됨</a>
        </nav>
        <div className="demo-note">
          <strong>Demo 모드</strong>
          <p>실제 개인정보 없이 Trace의 핵심 경험을 체험합니다.</p>
          <a href="/">내 기록으로 시작하기 →</a>
        </div>
      </aside>

      <main className="demo-main">
        <header className="demo-topbar">
          <form className="demo-search" onSubmit={submit}>
            <span>⌕</span>
            <input aria-label="Trace 검색" value={input} onChange={(e) => setInput(e.target.value)} />
            <button aria-label="검색">→</button>
          </form>
          <button className="icon-button" aria-label="알림">♢</button>
        </header>

        <section className="result-heading">
          <span className="eyebrow">AI 기억 검색</span>
          <h1>“{query}”에 대한 기억을 찾았어요.</h1>
          <p>정확한 제목이나 URL 대신, 기억나는 단서로 검색할 수 있어요.</p>
        </section>

        <section className="primary-result-grid">
          <MemoryCard memory={primary} />
          <aside className="match-card">
            <span className="match-label">가장 관련 높은 결과</span>
            <h2>왜 이 결과를 찾았나요?</h2>
            <ul>
              <li><b>검정</b> 컬러가 저장된 태그와 일치해요.</li>
              <li><b>러닝화</b> 카테고리예요.</li>
              <li>가격이 <b>189,000원</b>으로 20만원대에 가까워요.</li>
              <li><b>3일 전</b>에 저장한 최근 기억이에요.</li>
            </ul>
            <a className="primary-button" href="https://www.nike.com" target="_blank" rel="noreferrer">원래 페이지 열기 ↗</a>
          </aside>
        </section>

        <section className="related-section">
          <div className="section-title-row">
            <div><span className="eyebrow">함께 본 기억</span><h2>같은 탐색 흐름에서 본 것들</h2></div>
            <span className="muted">브라우징 맥락</span>
          </div>
          <div className="related-list">
            {related.map((memory, index) => (
              <div className="timeline-row" key={memory.id}>
                <div className="timeline-dot">{index + 1}</div>
                <CompactMemoryCard memory={memory} />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
