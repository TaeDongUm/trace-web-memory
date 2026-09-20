import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import ImportReview from './ImportReview';

export const dynamic = 'force-dynamic';

export default async function Import() {
  const client = await supabaseServer();
  if (!client) redirect('/login');
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');

  return <div className="demo-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span>◉</span>Trace</Link>
      <div className="sidebar-caption">나만의 기억 공간</div>
      <nav aria-label="기억 관리">
        <Link href="/home">나만의 기억</Link>
        <Link className="active" href="/import">여러 페이지 가져오기</Link>
        <Link href="/demo">데모 둘러보기 ↗</Link>
      </nav>
      <div className="demo-note">
        <strong>예시 후보 목록입니다</strong>
        <p>실제 방문 기록을 자동으로 읽지 않아요. 최종 기능이 어떻게 동작할지 보여드리는 시연 화면입니다.</p>
      </div>
      <form action="/auth/sign-out" method="post"><button className="ghost-button">로그아웃</button></form>
    </aside>
    <main className="demo-main">
      <div className="demo-mobile-brand"><Link className="brand" href="/">◉ Trace</Link><span>여러 페이지 가져오기</span></div>
      <header className="search-intro">
        <span className="eyebrow">여러 페이지 가져오기 · 베타</span>
        <h1>기간을 골라 한 번에 검토하고 저장하세요.</h1>
        <p>은행·메일·건강정보처럼 민감해 보이는 페이지는 기본적으로 제외해 두었어요. 직접 확인한 뒤 포함할 수 있습니다.</p>
      </header>
      <ImportReview />
    </main>
  </div>;
}
