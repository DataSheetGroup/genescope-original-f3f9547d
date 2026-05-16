export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <div className="text-xs font-semibold tracking-[0.18em] uppercase text-primary mb-3">
          {eyebrow}
        </div>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold text-foreground">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-base text-muted-foreground leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
