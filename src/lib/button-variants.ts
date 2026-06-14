import { cva } from "class-variance-authority";

/**
 * Lives in /lib (no "use client") so it can be imported by both client
 * components (Button) and server components that need className strings.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2",
    "text-xs font-medium uppercase tracking-[0.15em] whitespace-nowrap",
    "transition-all duration-150 outline-none select-none cursor-pointer",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.98]",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: "bg-foreground text-background hover:bg-foreground/80",
        outline:
          "border border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background",
        ghost: "bg-transparent text-foreground hover:bg-foreground/8",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        destructive: "bg-destructive text-white hover:bg-destructive/80",
        link: "text-foreground underline underline-offset-4 hover:opacity-60 p-0 h-auto",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-[0.7rem]",
        lg: "h-14 px-10 text-sm",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);
