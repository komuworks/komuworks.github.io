export function formatDate(dateText: string, locale = 'ja-JP'): string {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function formatYearMonth(dateText: string | null, locale = 'ja-JP'): string {
  if (!dateText) {
    return '期限なし';
  }

  const date = new Date(`${dateText}-01`);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
  }).format(date);
}

export function formatCount(count: number, suffix = '件'): string {
  return `${count}${suffix}`;
}

export function formatLevel(level: number): string {
  return `Lv.${level}`;
}

export function formatExperienceYears(years: number): string {
  return `${years}年`;
}
