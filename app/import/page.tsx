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

  return <main className="account-page"><section className="account-card">
    <header className="account-header"><Link className="brand" href="/">◉ Trace</Link><Link className="ghost-button" href="/home">나만의 기억</Link></header>
    <span className="eyebrow">여러 페이지 가져오기 · 베타</span>
    <h1>기간을 골라 한 번에 검토하고 저장하세요.</h1>
    <p className="account-notice">
      지금은 실제 방문 기록을 자동으로 읽지 않고, 최종 기능이 어떻게 동작할지 보여드리는 예시 후보 목록입니다.
      은행·메일·건강정보처럼 민감해 보이는 페이지는 기본적으로 제외해 두었고, 직접 확인 후 포함할 수 있습니다.
      실제 방문 기록 자동 스캔은 다음 단계로 준비 중입니다.
    </p>
    <ImportReview />
  </section></main>;
}
