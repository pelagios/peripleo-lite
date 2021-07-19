import json

INPUT_FILE = './monuments.json'

OUTPUT_FILE = './ascsa-monuments.lp.json'


def to_linked_place(record):
  # Agora:Monument:Aiakeion,
  id = f'https://agora.ascsa.net/id/{record["Id"].replace(":", "/").replace(" ", "%20")}'
  
  name = record['Name'][0]

  depictions = [
    f'https://agora.ascsa.net/image?type=review&id={record["Icon"][0].partition("::")[0]}' # ["Agora:Image:1997.14.0150::/Agora/1997/1997.14/1997.14.0150.tif::1142::682"],
  ] if 'Icon' in record else []

  coords = record['WGS84Polygon'][0].split(';') if 'WGS84Polygon' in record else []
  coords = [ c.split(',') for c in coords ]
  coords = [ [ float(c[0]), float(c[1])] for c in coords ] 

  lp = {
    '@id': id,
    'type': 'Feature',
    'properties': {
      'title': name,
      'description': record['Chronology']
    }
  }

  if len(depictions) > 0:
    lp['depictions'] = depictions

  if len(coords) > 0:
    lp['geometry'] = {
      'type': 'Polygon',
      'coordinates': [ coords ]
    }

  return lp

with open(INPUT_FILE) as infile:
  dump = json.load(infile)

  geojson = {
    'type': 'FeatureCollection',
    'features': [ to_linked_place(record) for record in dump['response']['docs'] ]
  }

  with open(OUTPUT_FILE, 'w') as outfile:
    json.dump(geojson, outfile)

