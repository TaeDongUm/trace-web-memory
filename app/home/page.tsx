import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import SaveForm from './SaveForm';
import MemorySearch from './MemorySearch';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const client = await supabaseServer();
  if (!client) redirect('/login');
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await client.from('memories').select('id,title,url,summary,category,tags,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  const params = await searchParams;
  const memories = data ?? [];

  return <div className="demo-shell">
    <aside className="sidebar">
      <Link className="brand" href="/"><span>◉</span>Trace</Link>
      <div className="sidebar-caption">나만의 기억 공간</div>
      <nav aria-label="기억 관리">
        <Link className="active" href="/home">나만의 기억 <span>{memories.length}</span></Link>
        <Link href="/import">여러 페이지 가져오기</Link>
        <Link href="/demo">데모 둘러보기 ↗</Link>
      </nav>
      <div className="demo-note">
        <strong>브라우저 기록과 별도 관리</strong>
        <p>로그인만으로 방문 기록을 가져오지 않아요. 직접 저장한 페이지만 여기 모입니다.</p>
      </div>
      <form action="/auth/sign-out" method="post"><button className="ghost-button">로그아웃</button></form>
    </aside>
    <main className="demo-main">
      <div className="demo-mobile-brand"><Link className="brand" href="/">◉ Trace</Link><span>나만의 기억</span></div>
      <header className="search-intro">
        <span className="eyebrow">나만의 기억</span>
        <h1>다시 찾을 기억을 모아두세요.</h1>
        <p>직접 선택한 공개 페이지의 제목·주소·요약을 저장하는 공간입니다.</p>
      </header>
      {params.error === 'logout' && <p role="alert">로그아웃을 완료하지 못했어요. 다시 시도해 주세요.</p>}
      <p className="account-notice">Chrome 확장 프로그램으로 지금 보는 페이지를 바로 저장할 수 있어요(개발자 모드 설치 필요). 아래에서 주소를 직접 입력해 저장할 수도 있습니다.</p>
      <SaveForm />
      {error ? <p role="alert">기억을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</p> : <MemorySearch memories={memories} />}
    </main>
  </div>;
}
