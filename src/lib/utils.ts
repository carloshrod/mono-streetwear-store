import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format a price stored in cents as a localized USD currency string. */
export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100)
}

/** Pick a random item from a non-empty array. */
export function pickRandom<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}
