'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { searchMemories, type SearchableMemory } from '@/lib/memory-search';

export default function MemorySearch({ memories }: { memories: SearchableMemory[] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const hits = useMemo(() => searchMemories(memories, query), [memories, query]);
  const isFiltering = query.trim().length > 0;

  async function deleteOne(id: string) {
    if (!window.confirm('이 기억을 삭제할까요?')) return;
    setDeletingId(id);
    try {
      await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      startTransition(() => router.refresh());
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteAll() {
    if (!window.confirm('저장된 기억을 전부 삭제할까요? 되돌릴 수 없어요.')) return;
    setDeletingAll(true);
    try {
      await fetch('/api/memories', { method: 'DELETE' });
      startTransition(() => router.refresh());
    } finally {
      setDeletingAll(false);
    }
  }

  if (memories.length === 0) return <p>아직 저장된 기억이 없어요.</p>;

  return (
    <div className="memory-search">
      <label className="sr-only" htmlFor="memory-query">기억 검색</label>
      <input
        id="memory-query" type="search"
        placeholder="예: 검정 러닝화, MCP 설명한 글…"
        value={query} onChange={(event) => setQuery(event.target.value)}
      />
      <button type="button" className="text-link" onClick={deleteAll} disabled={deletingAll || isPending}>
        {deletingAll ? '삭제 중…' : '전체 삭제'}
      </button>
      {isFiltering && hits.length === 0 && <p className="tiny-copy">일치하는 기억을 찾지 못했어요.</p>}
      <ul className="memory-list">
        {hits.map(({ memory, reasons, matchedCount, totalTokens }) => (
          <li key={memory.id}>
            <div className="memory-list-row">
              <a className="text-link" href={memory.url} target="_blank" rel="noopener noreferrer">{memory.title}</a>
              <button type="button" className="ghost-button" onClick={() => deleteOne(memory.id)} disabled={deletingId === memory.id || isPending}>
                {deletingId === memory.id ? '삭제 중…' : '삭제'}
              </button>
            </div>
            {memory.summary && <p className="tiny-copy">{memory.summary}</p>}
            {isFiltering && matchedCount < totalTokens && <p className="tiny-copy">일부 단서만 일치해요.</p>}
            {isFiltering ? (
              reasons.length > 0 && <div className="tag-row">{reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>
            ) : (
              memory.tags.length > 0 && <div className="tag-row">{memory.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
