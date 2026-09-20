'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { IMPORT_CANDIDATES, suggestSensitive } from '@/lib/import-candidates';

const ALL_DATES = IMPORT_CANDIDATES.map((c) => c.visitedAt).sort();
const MIN_DATE = ALL_DATES[0];
const MAX_DATE = ALL_DATES[ALL_DATES.length - 1];

type ItemResult = 'saved' | 'failed';

export default function ImportReview() {
  const [start, setStart] = useState(MIN_DATE);
  const [end, setEnd] = useState(MAX_DATE);
  const [included, setIncluded] = useState<Record<string, boolean>>(
    () => Object.fromEntries(IMPORT_CANDIDATES.map((c) => [c.id, !suggestSensitive(c.url)])),
  );
  const [phase, setPhase] = useState<'reviewing' | 'importing' | 'done'>('reviewing');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<Record<string, ItemResult>>({});

  const inRange = useMemo(
    () => IMPORT_CANDIDATES.filter((c) => c.visitedAt >= start && c.visitedAt <= end),
    [start, end],
  );
  const includedCount = inRange.filter((c) => included[c.id]).length;

  async function handleImport() {
    setPhase('importing');
    setProgress(0);
    const nextResults: Record<string, ItemResult> = {};
    const targets = inRange.filter((c) => included[c.id]);
    for (const candidate of targets) {
      try {
        const response = await fetch('/api/memories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: candidate.url, title: candidate.title }),
        });
        nextResults[candidate.id] = response.ok ? 'saved' : 'failed';
      } catch {
        nextResults[candidate.id] = 'failed';
      }
      setProgress((p) => p + 1);
    }
    setResults(nextResults);
    setPhase('done');
  }

  if (phase === 'done') {
    const savedCount = Object.values(results).filter((r) => r === 'saved').length;
    const failedCount = Object.values(results).filter((r) => r === 'failed').length;
    return (
      <div className="account-notice">
        <p role="status">가져오기 완료됐어요. {savedCount}개 저장{failedCount ? `, ${failedCount}개 실패` : ''}.</p>
        <Link className="primary-button" href="/home">나만의 기억에서 검색하기</Link>
      </div>
    );
  }

  return (
    <div className="save-form">
      <div className="import-range">
        <label>
          <span className="tiny-copy">시작일</span>
          <input type="date" value={start} min={MIN_DATE} max={end} onChange={(e) => setStart(e.target.value)} disabled={phase === 'importing'} />
        </label>
        <label>
          <span className="tiny-copy">종료일</span>
          <input type="date" value={end} min={start} max={MAX_DATE} onChange={(e) => setEnd(e.target.value)} disabled={phase === 'importing'} />
        </label>
      </div>

      <ul className="import-list">
        {inRange.map((candidate) => {
          const flagged = suggestSensitive(candidate.url);
          return (
            <li key={candidate.id}>
              <label className="import-item">
                <input
                  type="checkbox"
                  checked={Boolean(included[candidate.id])}
                  disabled={phase === 'importing'}
                  onChange={(e) => setIncluded((prev) => ({ ...prev, [candidate.id]: e.target.checked }))}
                />
                <span>
                  <strong>{candidate.title}</strong>
                  <span className="tiny-copy"> · {candidate.source} · {candidate.visitedAt}</span>
                  {flagged && <span className="tag-row"><span>민감할 수 있는 페이지 · 기본 제외됨</span></span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {phase === 'importing' ? (
        <p role="status">저장 중… ({progress}/{inRange.filter((c) => included[c.id]).length})</p>
      ) : (
        <button className="primary-button" type="button" onClick={handleImport} disabled={includedCount === 0}>
          선택한 {includedCount}개 가져오기 완료
        </button>
      )}
    </div>
  );
}
