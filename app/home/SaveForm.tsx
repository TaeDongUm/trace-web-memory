'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MEMORY_ERROR_MESSAGES } from '@/lib/memory-error-messages';

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
        setMessage({ type: 'error', text: MEMORY_ERROR_MESSAGES[data.error] ?? '저장하지 못했어요. 다시 시도해 주세요.' });
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
