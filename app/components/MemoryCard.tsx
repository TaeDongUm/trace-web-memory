import { DemoMemory } from "@/lib/demo-data";

function Visual({ accent, compact = false }: { accent: string; compact?: boolean }) {
  const labelMap: Record<string, string> = {
    shoe: "RUN",
    video: "▶",
    dark: "MCP",
    blue: "AIR",
    sand: "CAFE",
    code: "</>",
  };
  return <div className={`memory-visual visual-${accent} ${compact ? "compact" : ""}`}>{labelMap[accent] ?? "TRACE"}</div>;
}

export function MemoryCard({ memory }: { memory: DemoMemory }) {
  return (
    <article className="memory-card">
      <Visual accent={memory.accent} />
      <div className="memory-card-body">
        <div className="memory-meta">{memory.source} · {memory.viewed}</div>
        <h3>{memory.title}</h3>
        <p>{memory.summary}</p>
        <div className="tag-row">
          {memory.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}
        </div>
      </div>
    </article>
  );
}

export function CompactMemoryCard({ memory }: { memory: DemoMemory }) {
  return (
    <article className="compact-memory-card">
      <Visual accent={memory.accent} compact />
      <div>
        <strong>{memory.title}</strong>
        <div className="memory-meta">{memory.domain} · {memory.viewed}</div>
      </div>
    </article>
  );
}
