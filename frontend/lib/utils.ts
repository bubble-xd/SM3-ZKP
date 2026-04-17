import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMs(value?: number | null) {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return `${value.toFixed(2)} ms`;
}

export function formatBytes(value?: number | null) {
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(2)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function safeJsonParse<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

