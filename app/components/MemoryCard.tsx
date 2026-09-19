import { type DemoMemory, savedLabel } from "@/lib/demo-data";
function Visual({ memory, compact = false }: { memory: DemoMemory; compact?: boolean }) {
  const labels: Record<string, string> = { shoe: "RUN", video: "▶", dark: "MCP", blue: "AIR", code: "</>" };
  return <div aria-hidden="true" className={`memory-visual visual-${memory.accent} ${compact ? "compact" : ""}`}>{labels[memory.accent] ?? "TRACE"}</div>;
}
export function MemoryCard({ memory }: { memory: DemoMemory }) {
  return <article className="memory-card"><Visual memory={memory} /><div className="memory-card-body">
    <div className="memory-meta">{memory.source} · {savedLabel(memory)}</div><h3>{memory.title}</h3><p>{memory.summary}</p>
    {memory.price !== undefined && <p className="price">{memory.price.toLocaleString("ko-KR")}원 <small>데모 가격 기록</small></p>}
    <div className="tag-row">{memory.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
  </div></article>;
}
export function CompactMemoryCard({ memory }: { memory: DemoMemory }) {
  return <article className="compact-memory-card"><Visual memory={memory} compact /><div>
    <strong>{memory.title}</strong><div className="memory-meta">{memory.source} · {savedLabel(memory)}</div>
    <a className="text-link" href={memory.url} target="_blank" rel="noopener noreferrer">원본 페이지 열기 ↗<span className="sr-only"> · {memory.title} · 새 탭</span></a>
  </div></article>;
}
