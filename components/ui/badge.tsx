import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center border px-2.5 py-1 text-[10px] font-sans font-medium tracking-label uppercase",
  {
    variants: {
      variant: {
        gold: "border-gold text-gold bg-transparent",
        burgundy: "border-burgundy text-burgundy bg-transparent",
        rose: "border-rose text-rose bg-transparent",
        solid: "bg-burgundy text-ivory border-transparent",
        muted: "border-taupe/40 text-taupe bg-transparent",
      },
    },
    defaultVariants: { variant: "muted" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
