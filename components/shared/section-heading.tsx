import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  light,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string | null;
  align?: "center" | "left";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "text-xs tracking-label uppercase font-medium",
            light ? "text-gold" : "text-burgundy"
          )}
        >
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          "font-serif-display text-3xl md:text-4xl lg:text-[2.75rem] leading-[1.15]",
          light ? "text-ivory" : "text-soft-black"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "max-w-xl text-sm md:text-base leading-relaxed",
            light ? "text-ivory/80" : "text-taupe"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
