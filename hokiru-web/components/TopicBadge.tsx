export function TopicBadge({ topic }: { topic: string }) {
  return (
    <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-muted">
      {topic}
    </span>
  );
}
