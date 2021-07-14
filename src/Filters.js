import { getTags } from './store/Annotation';

export const hasTagFilter = tag => annotation => {
  const tags = getTags(annotation);
  return tags.includes(tag);
}
