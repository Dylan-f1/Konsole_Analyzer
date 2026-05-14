export default function TechStackBadges({ techStack }) {
  if (!techStack?.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Stack technique</h3>
        <p className="text-sm text-zinc-400">Aucune technologie détectée</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Stack technique</h3>
      <div className="flex flex-wrap gap-2">
        {techStack.map((tech) => (
          <span
            key={tech}
            className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
