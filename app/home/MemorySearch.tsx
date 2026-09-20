'use client';

import { type FormEvent, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { searchMemories, type SearchableMemory } from '@/lib/memory-search';

export default function MemorySearch({ memories }: { memories: SearchableMemory[] }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [isPending, startTransition] = useTransition();
  const hits = useMemo(() => searchMemories(memories, query), [memories, query]);
  const isFiltering = query.trim().length > 0;

  function submit(event: FormEvent) {
    event.preventDefault();
    setQuery(input.trim());
  }

  async function deleteOne(id: string) {
    if (!window.confirm('이 기억을 삭제할까요?')) return;
    setDeletingId(id);
    setDeleteError('');
    try {
      const response = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('delete_failed');
      startTransition(() => router.refresh());
    } catch {
      setDeleteError('삭제를 완료하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteAll() {
    if (!window.confirm('저장된 기억을 전부 삭제할까요? 되돌릴 수 없어요.')) return;
    setDeletingAll(true);
    setDeleteError('');
    try {
      const response = await fetch('/api/memories', { method: 'DELETE' });
      if (!response.ok) throw new Error('delete_failed');
      startTransition(() => router.refresh());
    } catch {
      setDeleteError('삭제를 완료하지 못했어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      setDeletingAll(false);
    }
  }

  return (
    <>
      {deleteError && <p role="alert" className="save-error">{deleteError}</p>}
      <form className="demo-search" onSubmit={submit} role="search">
        <label className="sr-only" htmlFor="memory-query">기억 검색</label>
        <span aria-hidden="true">⌕</span>
        <input
          id="memory-query" value={input} maxLength={200}
          onChange={(event) => setInput(event.target.value)}
          placeholder="예: 검정 러닝화, MCP 설명한 글…"
        />
        <button type="submit" aria-label="검색">→</button>
      </form>

      <section className="result-heading" aria-live="polite" aria-atomic="true">
        <h2>{isFiltering ? `"${query}"` : '저장된 모든 기억'}</h2>
        <p>
          {memories.length === 0 ? '아직 저장된 기억이 없어요.' : isFiltering && hits.length === 0 ? '일치하는 기억이 없어요.' : `${hits.length}개의 ${isFiltering ? '검색 후보' : '기억'}`}
          {memories.length > 0 && (
            <button type="button" className="inline-action" onClick={deleteAll} disabled={deletingAll || isPending}>
              {deletingAll ? ' 삭제 중…' : ' · 전체 삭제'}
            </button>
          )}
        </p>
      </section>

      {memories.length === 0 ? (
        <section className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>아직 저장된 기억이 없어요</h2>
          <p>‘기억 추가 체험’에서 공개 페이지 카드를 골라 저장해 보세요. 저장한 페이지는 이곳에서 다시 찾을 수 있어요.</p>
        </section>
      ) : (
        <div className="related-list">
          {hits.map(({ memory, reasons, matchedCount, totalTokens }) => (
            <article className="compact-memory-card" key={memory.id}>
              <div className="memory-visual compact visual-blue" aria-hidden="true">TR</div>
              <div>
                <strong>{memory.title}</strong>
                <div className="memory-meta">{memory.category ?? '기억'} · {new Date(memory.created_at).toLocaleDateString('ko-KR')}</div>
                {memory.summary && <p className="tiny-copy">{memory.summary}</p>}
                {isFiltering && matchedCount < totalTokens && <p className="tiny-copy">일부 단서만 일치해요.</p>}
                {isFiltering ? (
                  reasons.length > 0 && <div className="tag-row">{reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>
                ) : (
                  memory.tags.length > 0 && <div className="tag-row">{memory.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                )}
                <div className="memory-list-row">
                  <a className="text-link" href={memory.url} target="_blank" rel="noopener noreferrer">원본 페이지 열기 ↗</a>
                  <button type="button" className="ghost-button" onClick={() => deleteOne(memory.id)} disabled={deletingId === memory.id || isPending}>
                    {deletingId === memory.id ? '삭제 중…' : '삭제'}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
