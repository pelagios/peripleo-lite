const loadTEI = (url, graph) => fetch(url)
  .then(response => response.text())
  .then(str => {
    graph.beginUpdate();

    // TODO hack!
    graph.addNode('Pausanias');

    const parser = new DOMParser();
    const xml = parser.parseFromString(str, 'text/xml');

    const placeNames = xml.querySelectorAll('placeName');
    
    Array.from(placeNames).forEach(placeName => {
      const ref = placeName.getAttribute('ref');
      
      // If there's a ref, check if it's part of the graph
      if (ref) {
        const targetNode = graph.getNode(ref);

        // If it is, link it
        if (targetNode)
          graph.addLink('Pausanias', normalizeURL(targetNode.id));
      }
    });

    graph.endUpdate();
  });