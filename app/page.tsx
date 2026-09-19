import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing-page">
      <header className="landing-nav">
        <div className="brand"><span>◉</span>Trace</div>
        <nav>
          <a href="#how">어떻게 작동하나요?</a>
          <a href="#privacy">개인정보 보호</a>
        </nav>
        <Link className="ghost-button" href="/demo">데모 체험</Link>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">AI가 기억하는 당신의 브라우징</span>
          <h1>분명 봤는데,<br/><strong>어디서 봤지?</strong></h1>
          <p className="hero-subtitle">URL이나 정확한 제목을 기억하지 않아도 괜찮아요.<br/>Trace가 당신이 본 것의 의미를 기억하고 다시 찾아드려요.</p>

          <div className="hero-query">⌕ <span>저번에 본 20만원대 검은 운동화</span><b>→</b></div>
          <div className="hero-actions">
            <Link className="primary-button" href="/demo">로그인 없이 둘러보기</Link>
            <Link className="secondary-button" href="/login">Google로 시작하기</Link>
          </div>
          <p className="tiny-copy">공개 콘텐츠 10개로 기억 검색을 체험하세요. 개인 기록 수집이나 외부 AI 호출은 없습니다.</p>
        </div>

        <div className="hero-demo-card" aria-label="Trace 검색 예시">
          <div className="query-bubble">“저번에 본 20만원대 검은 운동화”</div>
          <div className="memory-preview">
            <div className="memory-visual visual-shoe compact">RUN</div>
            <div>
              <span className="mini-label">예시 기억 · 9월 17일 저장</span>
              <h3>Nike Pegasus 42</h3>
              <b>₩169,000 · 데모 가격</b>
              <p>nike.com</p>
            </div>
          </div>
          <div className="match-chips"><span>검정</span><span>러닝화</span><span>가격 조건은 불일치</span></div>
          <div className="arrow-note">기억의 단서 → 원래 페이지</div>
        </div>
      </section>

      <section className="how-it-works" id="how">
        <div className="section-intro"><span className="eyebrow">How Trace works</span><h2>링크가 아니라, 기억의 맥락을 저장합니다.</h2></div>
        <div className="step-grid">
          <article><span>01</span><h3>기억하기</h3><p>보고 있는 페이지를 Trace에 저장합니다.</p></article>
          <article><span>02</span><h3>AI 구조화</h3><p>제목·요약·태그를 검색 가능한 Memory로 정리합니다.</p></article>
          <article><span>03</span><h3>다시 찾기</h3><p>불완전한 기억만 입력해도 원래 페이지로 돌아갑니다.</p></article>
        </div>
      </section>

      <section className="privacy-strip" id="privacy">
        <div><span className="eyebrow">Privacy by design</span><h2>모든 브라우징을 감시하지 않습니다.</h2></div>
        <p>Trace는 사용자가 기억하고 싶은 웹 활동을 중심으로 최소한의 정보만 저장하는 것을 기본 원칙으로 합니다.</p>
      </section>
    </main>
  );
}
