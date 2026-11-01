export function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="label-mono">{eyebrow}</p>
      <h2 className="mt-3 max-w-[26ch] font-display text-display font-medium text-fg">{title}</h2>
    </div>
  );
}
