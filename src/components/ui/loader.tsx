
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg";
  variant?: "default" | "primary";
}

export function Loader({
  size = "default",
  variant = "default",
  className,
  ...props
}: LoaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        className
      )}
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin",
          {
            "h-4 w-4": size === "sm",
            "h-6 w-6": size === "default",
            "h-8 w-8": size === "lg",
            "text-primary": variant === "primary",
            "text-muted-foreground": variant === "default",
          }
        )}
      />
    </div>
  );
}
