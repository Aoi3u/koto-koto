export type KeyAdvice = {
  key: string;
  count: number;
};

const KEY_LABELS: Record<string, string> = {
  ',': 'comma',
  '.': 'period',
  '-': 'hyphen',
};

const labelKey = (key: string) => KEY_LABELS[key] ?? key.toUpperCase();

export function getTopMistypedKeys(
  mistypedKeyCounts: Record<string, number>,
  topN = 3
): KeyAdvice[] {
  return Object.entries(mistypedKeyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([key, count]) => ({ key: labelKey(key), count }));
}
