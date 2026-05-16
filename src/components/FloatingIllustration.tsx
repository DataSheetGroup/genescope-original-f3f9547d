type Props = {
  src: string;
  alt?: string;
  className?: string;
  rotate?: number;
  variant?: "float" | "drift";
};

export function FloatingIllustration({
  src,
  alt = "",
  className = "",
  rotate = 0,
  variant = "float",
}: Props) {
  const anim = variant === "float" ? "animate-float" : "animate-drift";
  return (
    <img
      src={src}
      alt={alt}
      aria-hidden={!alt}
      className={`pointer-events-none select-none ${anim} ${className}`}
      style={{ ["--rot" as never]: `${rotate}deg`, transform: `rotate(${rotate}deg)` }}
    />
  );
}
