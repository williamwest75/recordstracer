interface NewResultsBadgeProps {
  count: number;
}

const NewResultsBadge = ({ count }: NewResultsBadgeProps) => {
  if (count <= 0) return null;

  return (
    <span className="absolute -top-2 -right-2 z-10 inline-flex items-center gap-1 bg-success text-success-foreground text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shadow-sm">
      +{count} new
    </span>
  );
};

export default NewResultsBadge;
