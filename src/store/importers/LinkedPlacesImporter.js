import bbox from '@turf/bbox';
import { normalizeURL } from '.';

const normalizeFeature = (feature, name) => {
  const normalized = { ...feature };

  const id = normalizeURL(feature['@id']);

  // LP uses '@id', whereas our graph nodes generally use only 'id'
  delete normalized['@id'];
  normalized.id = id;
  normalized.properties.dataset = name;
        
  return normalized;
}

const getBounds = feature => {
  if (feature.geometry) {
    if (feature.geometry.type === 'Point') {
      const [ x, y ] = feature.geometry.coordinates;
      return { minX: x, minY: y, maxX: x, maxY: y, feature };
    } else {
      const [ minX, minY, maxX, maxY ] = bbox(feature);
      return { minX, minY, maxX, maxY, feature };
    }
  } 
}

const toDocument = feature => ({
  id: feature.id,
  title: feature.title,
  type: 'Feature',
  dataset: feature.properties.dataset,
  names: feature.names?.map(n => n.toponym)
})

/**
 * An importer for Linked Places datasets. Applies a few normalizations
 * to on the data structure to fit the internal Peripleo graph node model.
 */
export const importLinkedPlaces = (name, url, graph, tree, search) => 
  fetch(url)    
    .then(response => response.json())
    .then(data => {
      console.log(`Importing LP: ${name} (${data.features.length} features)`);

      graph.beginUpdate();

      // Add nodes to graph and spatial tree
      const normalized = data.features.map(feature => {
        const normalized = normalizeFeature(feature, name);

        graph.addNode(normalized.id, normalized);

        const bounds = getBounds(normalized);
        if (bounds)
          tree.insert(bounds);

        return normalized;
      });

      // Add edges to graph
      normalized
        .filter(feature => feature.links?.length > 0)
        .forEach(feature => 
          feature.links.forEach(link => {
            // In LinkedPlaces, links have the shape
            // { type, identifier }

            const sourceId = feature.id;
            const targetId = normalizeURL(link.identifier);

            // Normalize in place
            link.identifier = targetId;

            // Note that this will create 'empty nodes' for targets not yet in
            graph.addLink(sourceId, targetId, link);
          })
        );

      graph.endUpdate();

      // Add to search index
      search.addDocuments(normalized.map(toDocument));
    });

