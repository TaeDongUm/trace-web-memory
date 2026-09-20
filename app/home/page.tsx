import Link from 'next/link';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase/server';
import SaveForm from './SaveForm';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const client = await supabaseServer();
  if (!client) redirect('/login');
  const { data: { user } } = await client.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await client.from('memories').select('id,title,url,summary,tags,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
  const params = await searchParams;
  return <main className="account-page"><section className="account-card">
    <header className="account-header"><Link className="brand" href="/">◉ Trace</Link><form action="/auth/sign-out" method="post"><button className="ghost-button">로그아웃</button></form></header>
    <span className="eyebrow">나만의 기억</span><h1>다시 찾을 기억을 모아두세요.</h1>
    {params.error === 'logout' && <p role="alert">로그아웃을 완료하지 못했어요. 다시 시도해 주세요.</p>}
    <p>직접 선택한 공개 페이지의 제목·주소·요약을 저장하는 공간입니다. 로그인만으로 브라우저 기록을 가져오지 않아요.</p>
    <p className="account-notice">지금은 저장하고 싶은 페이지의 주소를 직접 입력해서 저장해요. 현재 보는 페이지를 자동으로 저장하는 확장 프로그램은 준비 중이에요. 브라우저 방문 기록과 Trace의 기억은 별도로 관리됩니다.</p>
    <SaveForm />
    {error ? <p role="alert">기억을 불러오지 못했어요. 잠시 후 새로고침해 주세요.</p> : data.length ? (
      <ul className="memory-list">{data.map(memory => (
        <li key={memory.id}>
          <a className="text-link" href={memory.url} target="_blank" rel="noopener noreferrer">{memory.title}</a>
          {memory.summary && <p className="tiny-copy">{memory.summary}</p>}
          {memory.tags?.length ? <div className="tag-row">{memory.tags.map((tag: string) => <span key={tag}>{tag}</span>)}</div> : null}
        </li>
      ))}</ul>
    ) : <p>아직 저장된 기억이 없어요.</p>}
    <Link className="secondary-button" href="/demo">나중에 하기 · 데모 둘러보기</Link>
  </section></main>;
}
