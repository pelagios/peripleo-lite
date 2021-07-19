// Cache distinct tags and only re-read in
// case the store has different datasets
const TAGS = {
  'datasets': new Set(),
  'tags': []
};

/** Returns all unique tags in all annotations in the store **/
export const listTags = store => {
  const datasets = new Set(store.listDatasets());

  const tags = new Set();

  if (TAGS.datasets != datasets) {
    TAGS.datasets = datasets;

    const nodes = store.listAllNodes(null, 'Annotation');
    nodes.forEach(node => {
      node.data.body
        .filter(b => b.purpose === 'tagging')
        .forEach(b => tags.add(b.value));
    });

    const asArray = Array.from(tags);
    asArray.sort();

    TAGS.tags = asArray;
  }

  return TAGS.tags;
}