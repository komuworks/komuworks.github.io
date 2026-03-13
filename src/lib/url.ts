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

export const toGoalList = (): string => '/profile/goals/';

export const toGoalDetail = (id: string): string => `/profile/goals/${encodePathSegment(id)}/`;

export const toLearningDetail = (id: string): string =>
  `/profile/learnings/${encodePathSegment(id)}/`;

export const toTypingIndex = (): string => '/typing/';

export const toTypingDetail = (date: string): string => `/typing/${encodePathSegment(date)}/`;

export const toLegacyHome = (): string => '/old/';
