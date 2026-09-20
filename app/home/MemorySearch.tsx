'use client';

import { useMemo, useState } from 'react';
import { searchMemories, type SearchableMemory } from '@/lib/memory-search';

export default function MemorySearch({ memories }: { memories: SearchableMemory[] }) {
  const [query, setQuery] = useState('');
  const hits = useMemo(() => searchMemories(memories, query), [memories, query]);
  const isFiltering = query.trim().length > 0;

  if (memories.length === 0) return <p>아직 저장된 기억이 없어요.</p>;

  return (
    <div className="memory-search">
      <label className="sr-only" htmlFor="memory-query">기억 검색</label>
      <input
        id="memory-query" type="search"
        placeholder="예: 검정 러닝화, MCP 설명한 글…"
        value={query} onChange={(event) => setQuery(event.target.value)}
      />
      {isFiltering && hits.length === 0 && <p className="tiny-copy">일치하는 기억을 찾지 못했어요.</p>}
      <ul className="memory-list">
        {hits.map(({ memory, reasons, matchedCount, totalTokens }) => (
          <li key={memory.id}>
            <a className="text-link" href={memory.url} target="_blank" rel="noopener noreferrer">{memory.title}</a>
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
