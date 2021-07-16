const toArray = arg =>
  Array.isArray(arg) ? arg : [ arg ];

/** 
 * Returns tag values in this annotation (body 
 * purpose = tagging).
 * 
 * @param arg annotation or list of annotations
 */
export const tagValues = arg =>
  toArray(arg).reduce((allValues, annotation) => {
    const values = toArray(annotation.body)
      .filter(b => b.purpose === 'tagging')
      .map(b => b.value);

    return [ ...allValues, ...values ];
  }, []);

  /**
   * Returns aggregate information about the links (bodies
   * of purpose = linking and purpose = identifying) contained
   * in the list of annotations.
   * 
   * @param annotations a list of annotations
   */
export const aggregateLinks = annotations => {

  // Modeled (in spirit...) a bit on ElasticSearch aggregations
  const aggregation = {};

  // Helper to take a list of values and aggregate them into
  // buckets [{ key: 'value', count: '# occurrences' }]
  const aggregateValues = (values, optBuckets) => {
    const buckets = optBuckets || {};

    values.forEach(val => {
      if (buckets[val]) {
        buckets[val] += 1;
      } else {
        buckets[val] = 1
      }
    });

    return buckets;
  }

  annotations.forEach(annotation => {
    const bodies = toArray(annotation.body);

    const linkIds = bodies
      .filter(b => (
        b.type === 'SpecificResource' &&
        (b.purpose === 'linking' || b.purpose === 'identifying') &&
        b.value
      ))
      .map(b => b.value);

    const tagValues = bodies
      .filter(b => b.purpose === 'tagging')
      .map(b => b.value);

    linkIds.forEach(uri => {
      if (aggregation[uri]) {
        const { count, tags } = aggregation[uri];

        aggregation[uri] = { 
          count: count + 1,
          tags: aggregateValues(tagValues, tags)
        }
      } else {
        aggregation[uri] = { 
          count: 1, 
          tags: aggregateValues(tagValues)
        }
      }
    });
  });

  // Convert to sorted list of buckets
  const asArray = Object.entries(aggregation).map(([ id, obj ]) => {
    const { count, tags } = obj;

    // Tags as array, sorted by count
    const tagArray = Object.entries(tags).map(([ tag, count ]) => ({ tag, count }));
    tagArray.sort((a, b) => (a.count < b.count) ? 1 : -1);

    return { id, count, tags: tagArray };
  });

  // Link ID buckets, sorted by count
  asArray.sort((a, b) => (a.count < b.count) ? 1 : -1);
  return asArray;

}