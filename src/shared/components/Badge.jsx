export function Badge({ children, variant = "default" }) {
  const styles = {
    default: "bg-white/[0.04] text-zinc-300 border-white/10",
    success: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    danger: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide border ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
