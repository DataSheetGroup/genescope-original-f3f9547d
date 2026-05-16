export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-3xl mx-auto" : "max-w-3xl"}>
      {eyebrow && (
        <div className="eyebrow text-coral mb-4">{eyebrow}</div>
      )}
      <h2 className="display-lg">{title}</h2>
      {subtitle && (
        <p className="mt-5 text-base text-foreground/75 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}
