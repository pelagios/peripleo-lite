import csv
import json
import pandas as pd

INPUT_FILE = './pleiades-places-latest.csv.gz'
df = pd.read_csv(INPUT_FILE, compression='gzip', quoting=csv.QUOTE_MINIMAL)

def to_feature(row):
  feature = {
    '@id': f'http://pleiades.stoa.org/places/{row["id"]}',
    'type': 'Feature',
    'properties': {
      'title': row['title']
    }
  }

  if not pd.isna(row['description']):
    feature['properties']['description'] = row['description']

  if not pd.isna(row['extent']):
    feature['geometry'] = json.loads(row['extent'])

  return feature

geojson = {
  'type': 'FeatureCollection',
  'features': list([ to_feature(row) for idx, row in df.iterrows() ])
}

with open('pleiades-places-latest.json', 'w') as outfile:
  json.dump(geojson, outfile)