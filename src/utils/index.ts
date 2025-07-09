import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const isStrOrNotNaNNum = (value: any) => {
  return (typeof value === 'number' || typeof value === 'string') && !isNaN(value as number);
};

/**
 * helper function to ensure safe number value display
 * return defaultValue when value is null, undefined or NaN
 */
export const safeNumberValue = (value: number | null | undefined, defaultValue: number = 0): number => {
  return value !== null && value !== undefined && !isNaN(value) ? value : defaultValue;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
