import { normalizeURL } from '.';

export const importLinkedPlaces = (url, ngraph, index) => 
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

