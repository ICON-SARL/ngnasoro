
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names or class name objects into a single string.
 * Uses clsx for class name composition and twMerge to handle Tailwind CSS class conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
