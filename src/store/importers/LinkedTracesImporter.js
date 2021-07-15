import { normalizeURL } from '.';

const normalizeAnnotation = annotation => {
  const normalized = { ...annotation };
  
  const id = normalizeURL(annotation.id);
  normalized.id = id;

  return normalized;
}

const getTarget = (annotation, dataset) => {
  const { target } = annotation;

  target.dataset = dataset;

  if (target.id) {
    target.id = normalizeURL(target.id);
    return target;
  } else if (target.source) {
    target.id = normalizeURL(target.source);
    return target;
  }
}

const getLinkBodies = annotation => 
  annotation.body
    .filter(b => (
      b.type === 'SpecificResource' && 
      (b.purpose === 'identifying' || b.purpose === 'linking') &&
      b.value))
    .map(body => ({
      ...body,
      value: normalizeURL(body.value)
    }))

const toDocument = target => ({
  id: target.id,
  title: target.label,
  type: target.type,
  dataset: target.dataset
})

export const importLinkedTraces = (name, url, graph, tree, search)  => 
  fetch(url)
    .then(response => response.json())
    .then(annotations => { 
      console.log(`Importing LT: ${name} (${annotations.length} annotations)`);

      graph.beginUpdate();
      
      const targets = annotations.reduce((targets, annotation) => {
        const normalized = normalizeAnnotation(annotation);

        // Add the annotation as a node
        graph.addNode(normalized.id, normalized);

        // Add the target as a node
        const target = getTarget(normalized, name);
        if (target)
          graph.addNode(target.id, target);

        // Add link bodies as edges
        getLinkBodies(annotation).forEach(body =>
          graph.addLink(annotation.id, body.value, body));

        return target ?  [...targets, target ] : targets;
      }, []);

      graph.endUpdate();

      // Add annotation targets to search index
      search.addDocuments(targets.map(toDocument))
    });