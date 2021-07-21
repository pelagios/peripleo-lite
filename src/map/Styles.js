export const circle = args => ({
  'type': 'circle',
  'paint': {
    'circle-radius': args?.radius || 4,
    'circle-color': args?.fill || '#fff',
    'circle-stroke-color': args?.stroke || '#000',
    'circle-stroke-width': args?.strokeWidth || 1
  }
});

export const scaledCircle = args => ({
  'type': 'circle',
  'paint': {
    'circle-radius': [
      'interpolate',
      [ 'linear' ],
      ['get', args.property ],
      args.minZoom || 1, args.minSize || 5,
      args.maxZoom || 5, args.maxSize || 12
    ],
    'circle-stroke-width': 1,
    'circle-color': args.fill || '#ff623b',
    'circle-stroke-color': args.stroke || '#8d260c'
  }
});

export const colorFill = args => ({
  'type': 'fill',
  'paint': {
    'fill-color': args?.fill || '#ff623b',
    'fill-opacity': args?.opacity || 0.15
  }
});
