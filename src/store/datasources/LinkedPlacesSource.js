import { normalizeURL } from '.';
import bbox from '@turf/bbox';

export const importLinkedPlaces = (url, ngraph, index, spatialTree) => 
  fetch(url)    
    .then(response => response.json())
    .then(data => {
      ngraph.beginUpdate();

      // Add nodes first
      data.features.forEach(feature => {
        // Normalize
        const uri = normalizeURL(feature['@id']);
        feature['@id'] = uri;
        feature.properties.uri = uri;
        
        ngraph.addNode(uri, feature);
        index[uri] = feature;

        if (feature.geometry) {
          if (feature.geometry.type === 'Point') {
            const [ x, y ] = feature.geometry.coordinates;
            spatialTree.insert({ minX: x, minY: y, maxX: x, maxY: y, feature });
          } else {
            const [ minX, minY, maxX, maxY ] = bbox(feature);
            spatialTree.insert({ minX, minY, maxX, maxY, feature });
          }
        } 
      });

      // Add edges next
      data.features.filter(f => f.links?.length > 0)
        .forEach(f => 
          f.links.forEach(l => {
            const sourceId = normalizeURL(f['@id']);
            const targetId = normalizeURL(l.identifier);

            l.identifier = targetId;

            // Note that this will create 'empty nodes' for targets not yet in
            ngraph.addLink(sourceId, targetId, l);
          })
        );

      ngraph.endUpdate();

      // TODO needs a proper interface to return GeoJSON + graph
      return data;
    });

