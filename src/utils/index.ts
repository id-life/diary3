import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const isStrOrNotNaNNum = (value: any) => {
  return (typeof value === 'number' || typeof value === 'string') && !isNaN(value as number);
};

/**
 * 确保安全数值显示的辅助函数
 * 当值为null、undefined或NaN时返回默认值
 */
export const safeNumberValue = (value: number | null | undefined, defaultValue: number = 0): number => {
  return value !== null && value !== undefined && !isNaN(value) ? value : defaultValue;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
