import json

INPUT_FILE = './monuments.json'

OUTPUT_FILE = './ascsa-monuments.lp.json'


def to_linked_place(record):
  # Agora:Monument:Aiakeion,
  id = f'https://agora.ascsa.net/id/{record["Id"].replace(":", "/").replace(" ", "%20")}'
  print(id)
  """
  title = record['locality'] if 'locality' in record else (
    record['city'] if 'city' in record else record['subregion'])

  return {
    '@id': f'http://gazetteer.dainst.org/place/{record["gazetteerId"]}',
    'properties': {
      'title': title,
      'description': record['name']
    },
    'geometry': {
      'type': 'Point',
      'coordinates': [
        float(record['location']['lon']),
        float(record['location']['lat'])
      ]
    }
  }
  """

with open(INPUT_FILE) as infile:
  dump = json.load(infile)

  for record in dump['response']['docs']:
    to_linked_place(record)