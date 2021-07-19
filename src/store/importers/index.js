export const normalizeURL = url =>
  url.replace('https://', 'http://');
  
export const toArray = arg =>
  Array.isArray(arg) ? arg : [ arg ];