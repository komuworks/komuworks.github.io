import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';
import { validateMetrics, type TypingMetric } from './typing';

export async function getBlogEntries(): Promise<CollectionEntry<'blog'>[]> {
  return getCollection('blog');
}

export async function getBlogEntriesByDateDesc(): Promise<CollectionEntry<'blog'>[]> {
  const entries = await getBlogEntries();
  return [...entries].sort((a, b) => b.data.date.localeCompare(a.data.date));
}

export async function getBlogTags(): Promise<string[]> {
  const entries = await getBlogEntries();
  return [...new Set(entries.flatMap((entry) => entry.data.tags))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export async function getBlogStaticPaths(): Promise<Array<{ params: { slug: string } }>> {
  const entries = await getBlogEntries();
  return entries.map((entry) => ({
    params: { slug: entry.data.slug },
  }));
}

export async function getBlogEntryBySlug(
  slug: string,
): Promise<CollectionEntry<'blog'> | undefined> {
  return getEntry('blog', slug);
}

function toValidatedTypingMetric(entry: CollectionEntry<'typing'>): TypingMetric | null {
  return validateMetrics(entry.data);
}

export async function getTypingMetrics(): Promise<TypingMetric[]> {
  const entries = await getCollection('typing');

  return entries
    .map((entry) => toValidatedTypingMetric(entry))
    .filter((entry): entry is TypingMetric => entry !== null);
}

export async function getTypingMetricsByDateDesc(): Promise<TypingMetric[]> {
  const metrics = await getTypingMetrics();
  return [...metrics].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTypingStaticPaths(): Promise<Array<{ params: { date: string } }>> {
  const metrics = await getTypingMetrics();

  return metrics.map((metric) => ({
    params: { date: metric.date },
  }));
}

export async function getTypingMetricByDate(date: string): Promise<TypingMetric | null> {
  const entry = await getEntry('typing', date);
  if (!entry) {
    return null;
  }

  return validateMetrics(entry.data);
}
