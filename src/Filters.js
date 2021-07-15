import { getTags } from './Annotation';

export const hasTagFilter = tag => annotation => {
  const tags = getTags(annotation);
  return tags.includes(tag);
}
