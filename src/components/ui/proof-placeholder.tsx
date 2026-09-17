type ProofPlaceholderProps = {
  label?: string;
  tone?: "dark" | "light";
  className?: string;
};

export function ProofPlaceholder({
  label = "[INSERIR PRINT REAL]",
  tone = "dark",
  className = "",
}: ProofPlaceholderProps) {
  const toneClass =
    tone === "light" ? "placeholder-proof-light" : "placeholder-proof";

  return (
    <div
      className={`${toneClass} flex min-h-[240px] flex-col items-center justify-center rounded-[14px] px-5 py-8 text-center text-sm uppercase tracking-wider ${className}`.trim()}
      aria-hidden="true"
    >
      <span>{label}</span>
    </div>
  );
}
