import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tiện ích kết hợp class Tailwind và xử lý xung đột class tự động
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
