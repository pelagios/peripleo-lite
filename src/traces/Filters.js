import { tagValues } from '../AnnotationUtils';

export const hasTagFilter = tag => () => annotation =>
  tagValues(annotation).includes(tag);
