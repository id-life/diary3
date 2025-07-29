import { ENTRY_TYPE_THEME_COLORS } from '@/entry/types-constants';

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function getNewThemeColor(colorData: string[] | string | undefined | null): string {
  if (typeof colorData === 'string' && ENTRY_TYPE_THEME_COLORS.includes(colorData)) {
    return colorData;
  }

  if (Array.isArray(colorData) && colorData.length > 0) {
    const hash = simpleHash(colorData[0]);
    const index = hash % ENTRY_TYPE_THEME_COLORS.length;
    return ENTRY_TYPE_THEME_COLORS[index];
  }

  const randomIndex = Math.floor(Math.random() * ENTRY_TYPE_THEME_COLORS.length);
  return ENTRY_TYPE_THEME_COLORS[randomIndex];
}

export function convertEntryTypesToNewColors(entryTypes: any[]): any[] {
  if (!Array.isArray(entryTypes)) {
    return [];
  }

  return entryTypes.map((entryType) => {
    if (entryType.themeColor && typeof entryType.themeColor === 'string') {
      return entryType;
    }

    const newThemeColor = getNewThemeColor(entryType.themeColors);

    const { themeColors, ...rest } = entryType;
    return {
      ...rest,
      themeColor: newThemeColor,
    };
  });
}
