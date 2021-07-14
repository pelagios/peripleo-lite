export const getPlaces = annotations => {
  const places = {};

  annotations.forEach(annotation => {
    const placeUris = annotation.body.filter(b => (
        b.type == 'SpecificResource' && 
        b.purpose == 'identifying' && 
        b.value 
      )).map(b => b.value);

    placeUris.forEach(uri => {
      if (places[uri])
        places[uri] += 1;
      else 
        places[uri] = 1;
    });
  });

  return places;
}