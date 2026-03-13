export type TypingMetricInput = {
  date: string;
  totalChars: number;
  correctKeys: number;
  errorKeys: number;
  sessionMinutes: number | string;
};

export type TypingMetric = {
  date: string;
  totalChars: number;
  correctKeys: number;
  errorKeys: number;
  sessionMinutes: number;
};

export function parseSessionMinutes(value: number | string): number {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }

  if (typeof value !== 'string') {
    return Number.NaN;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return Number.NaN;
  }

  const numericValue = Number(trimmed);
  if (Number.isFinite(numericValue) && numericValue >= 0) {
    return numericValue;
  }

  const hourMinuteMatch = trimmed.match(/^(\d+)h(?:\s*(\d+)m)?$/i);
  if (hourMinuteMatch) {
    const hours = Number(hourMinuteMatch[1] ?? 0);
    const minutes = Number(hourMinuteMatch[2] ?? 0);
    return hours * 60 + minutes;
  }

  const minuteSecondMatch = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (minuteSecondMatch) {
    const minutes = Number(minuteSecondMatch[1]);
    const seconds = Number(minuteSecondMatch[2]);
    return minutes + seconds / 60;
  }

  return Number.NaN;
}

export function validateMetrics(entry: TypingMetricInput): TypingMetric | null {
  const sessionMinutes = parseSessionMinutes(entry.sessionMinutes);

  if (!entry.date || Number.isNaN(Date.parse(entry.date))) {
    return null;
  }

  const numericFields = [entry.totalChars, entry.correctKeys, entry.errorKeys, sessionMinutes];
  const hasInvalidNumber = numericFields.some((value) => !Number.isFinite(value) || value < 0);
  if (hasInvalidNumber) {
    return null;
  }

  if (entry.correctKeys + entry.errorKeys === 0) {
    return null;
  }

  return {
    date: entry.date,
    totalChars: entry.totalChars,
    correctKeys: entry.correctKeys,
    errorKeys: entry.errorKeys,
    sessionMinutes,
  };
}

export function calcCorrectRate(correctKeys: number, errorKeys: number): number {
  const totalKeys = correctKeys + errorKeys;
  if (totalKeys <= 0) {
    return 0;
  }

  return (correctKeys / totalKeys) * 100;
}
