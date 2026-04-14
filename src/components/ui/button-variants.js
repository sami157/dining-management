import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-sm font-semibold transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-none shadow-lg shadow-primary/40",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90",
        outline:
          "bg-muted border border-border hover:bg-muted hover:text-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground shadow-none",
        link: "text-primary underline-offset-4 hover:underline shadow-none p-0 h-auto",
      },
      size: {
        default: "px-5 py-2",
        sm: "px-4 py-1 text-xs",
        lg: "h-12 px-8",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export { buttonVariants };
