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
      .filter(body => body.purpose === 'tagging')
      .map(body => body.value);

    return [ ...allValues, ...values ];
  }, []);
