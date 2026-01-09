import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
  variant?: "default" | "glass" | "elevated" | "subtle";
  hover?: boolean;
  glow?: "none" | "primary" | "accent";
  padding?: "none" | "sm" | "md" | "lg";
}

const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ 
    className, 
    children, 
    variant = "default", 
    hover = true,
    glow = "none",
    padding = "md",
    ...props 
  }, ref) => {
    const variants = {
      default: "bg-white/80 backdrop-blur-2xl border border-white/50",
      glass: "bg-white/60 backdrop-blur-3xl border border-white/40",
      elevated: "bg-white backdrop-blur-xl border border-border/30",
      subtle: "bg-secondary/50 backdrop-blur-xl border border-border/20",
    };

    const glowStyles = {
      none: "",
      primary: "glow-primary",
      accent: "glow-accent",
    };

    const paddingStyles = {
      none: "",
      sm: "p-4",
      md: "p-6",
      lg: "p-8",
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "rounded-3xl shadow-soft-md",
          variants[variant],
          glowStyles[glow],
          paddingStyles[padding],
          hover && "transition-all duration-400 ease-premium",
          className
        )}
        whileHover={hover ? { 
          y: -4, 
          boxShadow: "0 16px 48px -12px rgba(0, 0, 0, 0.12)" 
        } : undefined}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

// Premium Card Header
const PremiumCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-4", className)}
    {...props}
  />
));
PremiumCardHeader.displayName = "PremiumCardHeader";

// Premium Card Title
const PremiumCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight text-foreground",
      className
    )}
    {...props}
  />
));
PremiumCardTitle.displayName = "PremiumCardTitle";

// Premium Card Description
const PremiumCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
PremiumCardDescription.displayName = "PremiumCardDescription";

// Premium Card Content
const PremiumCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
PremiumCardContent.displayName = "PremiumCardContent";

// Premium Card Footer
const PremiumCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4", className)}
    {...props}
  />
));
PremiumCardFooter.displayName = "PremiumCardFooter";

export {
  PremiumCard,
  PremiumCardHeader,
  PremiumCardTitle,
  PremiumCardDescription,
  PremiumCardContent,
  PremiumCardFooter,
};
