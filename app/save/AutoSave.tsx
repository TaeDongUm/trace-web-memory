'use client';

import { useEffect, useRef, useState } from 'react';
import { MEMORY_ERROR_MESSAGES } from '@/lib/memory-error-messages';

type Status = 'saving' | 'success' | 'error' | 'missing_url';

// 확장 프로그램이 아이콘 클릭으로 연 새 탭에서 곧바로 저장을 시작한다.
// 이 페이지는 사이트 자체(동일 출처)라서 로그인 쿠키가 그대로 전달되고,
// 기존 POST /api/memories(인증·검증·AI 구조화)를 그대로 재사용한다.
export default function AutoSave({ url, title }: { url: string; title: string }) {
  const [status, setStatus] = useState<Status>(url ? 'saving' : 'missing_url');
  const [message, setMessage] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (!url || started.current) return;
    started.current = true;
    (async () => {
      try {
        const response = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, title: title || undefined }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          setStatus('error');
          setMessage(MEMORY_ERROR_MESSAGES[data.error] ?? '저장하지 못했어요.');
          return;
        }
        setStatus('success');
        setMessage(data.structured ? 'AI가 요약·태그를 만들어 저장했어요.' : '저장했어요.');
      } catch {
        setStatus('error');
        setMessage('네트워크 오류로 저장하지 못했어요.');
      }
    })();
  }, [url, title]);

  if (status === 'missing_url') {
    return <p role="alert">저장할 주소가 없어요. 확장 프로그램 아이콘을 다시 눌러 주세요.</p>;
  }
  if (status === 'saving') return <p role="status">저장 중…</p>;

  return (
    <>
      <p role={status === 'error' ? 'alert' : 'status'} className={status === 'error' ? 'save-error' : 'save-success'}>{message}</p>
      <button type="button" className="ghost-button" onClick={() => window.close()}>이 창 닫기</button>
    </>
  );
}
