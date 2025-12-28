import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes intelligently.
 * Handles conflicts (e.g. 'px-2 px-4' -> 'px-4') and conditional classes.
 * Used by all ShadCN components.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ShadCN utility types for Svelte 5
// These generic types are required for component builders but trigger
// 'noExplicitAny' linting errors. We intentionally ignore them here.

// biome-ignore lint/suspicious/noExplicitAny: Generic builder types require any to be flexible
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;

// biome-ignore lint/suspicious/noExplicitAny: Generic builder types require any to be flexible
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;

export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};
