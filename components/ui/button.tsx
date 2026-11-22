import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "focus-ring inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-sans font-medium tracking-label uppercase transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-burgundy text-ivory hover:bg-burgundy-light border border-transparent hover:border-gold",
        secondary: "bg-transparent text-burgundy border border-burgundy hover:bg-burgundy hover:text-ivory",
        ghost: "bg-transparent text-soft-black hover:text-burgundy",
        gold: "bg-gold text-soft-black hover:bg-gold/90",
        whatsapp: "bg-[#25D366] text-white hover:bg-[#1ebe5b] border border-transparent",
        link: "underline-offset-4 hover:underline text-burgundy p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-12 px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
