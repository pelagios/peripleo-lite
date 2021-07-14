import { normalizeURL } from '.';

export const importLinkedTraces = (url, ngraph) => {

  const fAnnotations = fetch(url)
    .then(response => response.json())
    .then(annotations => { 
      ngraph.beginUpdate();
      
      annotations.forEach(annotation => {  
        // Add this annotation as a node
        const uri = annotation.id; // http://recogito.humlab.umu.se/annotation/1e14d9db-3e1f-4656-a4ec-b6de7a41f277
        ngraph.addNode(uri, annotation);

        const places = annotation.body.filter(b => (
            b.type === 'SpecificResource' && 
            b.purpose === 'identifying' &&
            b.value
          ));

        // Add gazetteer links
        places.forEach(placeBody => {
          const placeUri = normalizeURL(placeBody.value);
          ngraph.addLink(uri, placeUri, placeBody);
        });
      });

      ngraph.endUpdate();
    });

  return fAnnotations;

}