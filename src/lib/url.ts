const encodePathSegment = (value: string): string => encodeURIComponent(value);

export const toHome = (): string => '/';

export const toBlogIndex = (tag?: string): string => {
  if (!tag) {
    return '/blog/';
  }

  return `/blog/?tag=${encodeURIComponent(tag)}`;
};

export const toBlogPost = (slug: string): string => `/blog/${encodePathSegment(slug)}/`;

export const toProfileIndex = (): string => '/profile/';

export const toGoalDetail = (id: string): string => `/profile/goals/${encodePathSegment(id)}/`;

export const toCertificationDetail = (id: string): string =>
  `/profile/certifications/${encodePathSegment(id)}/`;

export const toLearningDetail = (id: string): string =>
  `/profile/learnings/${encodePathSegment(id)}/`;

export const toTypingIndex = (): string => '/typing/';

export const toTypingDetail = (date: string): string => `/typing/${encodePathSegment(date)}/`;
