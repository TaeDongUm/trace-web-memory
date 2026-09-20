'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_url: 'https로 시작하는 공개 페이지 주소만 저장할 수 있어요. (로컬/사설 주소는 저장할 수 없어요)',
  invalid_title: '제목이 너무 길어요. 500자 이하로 입력해 주세요.',
  invalid_body: '요청 형식이 올바르지 않아요.',
  invalid_json: '요청 형식이 올바르지 않아요.',
  payload_too_large: '입력이 너무 길어요.',
  unauthorized: '로그인이 필요해요. 새로고침 후 다시 시도해 주세요.',
  forbidden: '요청이 거부됐어요. 새로고침 후 다시 시도해 주세요.',
  auth_unavailable: '로그인 연결을 준비하고 있어요.',
  save_failed: '저장에 실패했어요. 잠시 후 다시 시도해 주세요.',
};

export default function SaveForm() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || undefined }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage({ type: 'error', text: ERROR_MESSAGES[data.error] ?? '저장하지 못했어요. 다시 시도해 주세요.' });
        return;
      }
      setUrl('');
      setTitle('');
      setMessage({ type: 'success', text: data.structured ? 'AI가 요약·태그를 만들어 저장했어요.' : '저장했어요.' });
      startTransition(() => router.refresh());
    } catch {
      setMessage({ type: 'error', text: '네트워크 오류로 저장하지 못했어요.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="save-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="memory-url">저장할 페이지 주소</label>
      <input
        id="memory-url" name="url" type="url" required
        placeholder="https://example.com/..."
        value={url} onChange={(event) => setUrl(event.target.value)}
      />
      <label className="sr-only" htmlFor="memory-title">제목 (선택)</label>
      <input
        id="memory-title" name="title" type="text"
        placeholder="제목 (비워두면 주소로 자동 생성돼요)"
        value={title} onChange={(event) => setTitle(event.target.value)}
      />
      <button className="primary-button" type="submit" disabled={saving || isPending}>
        {saving ? '저장 중…' : '저장하기'}
      </button>
      {message && (
        <p role={message.type === 'error' ? 'alert' : 'status'} className={message.type === 'error' ? 'save-error' : 'save-success'}>
          {message.text}
        </p>
      )}
    </form>
  );
}
