import json
import uuid

INPUT_FILE = './arachne-pausanias.json'

OUTPUT_LINKED_PLACES = './arachne-pausanias-places.lp.json'
OUTPUT_LINKED_TRACES = './arachne-pausanias-traces.lt.json'

def to_linked_place(record):
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

def to_linked_trace_annotation(record):

  bodies = []
  
  if 'places' in record:
    for place in record['places']:
      if 'gazetteerId' in place:
        body = {
          'type': 'SpecificResource',
          'purpose': 'linking',
          'value': f'http://gazetteer.dainst.org/place/{place["gazetteerId"]}',
        }

        if 'relation' in place:
          body['lpo:relation'] = place['relation']

        bodies.append(body)

  target = {
    'id': record['@id'],
    'title': record['title'],
    'type': record['type']
  }

  if 'description' in record:
    target['description'] = record['subtitle']

  return {
    '@context': 'http://www.w3.org/ns/anno.jsonld',
    'type': 'Annotation',
    'id': f'#{uuid.uuid4()}',
    'body': bodies,
    'target': target
  }

"""
Example record:

{
  "entityId": 3586991,
  "type": "Einzelobjekte",
  "title": "Kultbild: Hera (Paus. 9, 34, 3)",
  "subtitle": "Koroneia, Böotien (Regionalbezirk)",
  "places": [
    {
      "country": "Griechenland",
      "city": "Böotien (Regionalbezirk)",
      "gazetteerId": 2122184,
      "name": "Böotien (Regionalbezirk), Griechenland, Koroneia",
      "locality": "Koroneia",
      "location": {
        "lon": "22.957112",
        "lat": "38.391204"
      },
      "relation": "antike Erstaufstellung"
    }
  ],
  "highlights": {
    "searchableEditorContent": [
      "Datensatz-Gruppe: Arachne<hr>Interne Arbeitsnotiz: <em>bildwerke</em>-<em>pausanias</em>"
    ]
  },
  "@id": "http://arachne.dainst.org/entity/3586991"
}
"""
with open(INPUT_FILE) as infile:
  dump = json.load(infile)

  places = []

  ###
  # Compile LP gazetteer by aggregating all the places
  ###
  for entity in dump['entities']:

    # Not all entities are linked to places
    if 'places' in entity:
      for place in entity['places']:
        
        # Some records are simply "unbekannt" (sigh) - ignore
        if 'gazetteerId' in place and 'location' in place:
          gazetteer_id = place['gazetteerId']

          exists = any(p['gazetteerId'] == gazetteer_id for p in places)

          if not exists:
            places.append(place)

  print(f'Dataset contains {len(places)} distinct places')

  linked_places = {
    'type': 'FeatureCollection',
    '@context': 'https://raw.githubusercontent.com/LinkedPasts/linked-places/master/linkedplaces-context-v1.1.jsonld',
    'features': [ to_linked_place(p) for p in places ]
  }

  with open(OUTPUT_LINKED_PLACES, 'w') as outfile:
    json.dump(linked_places, outfile)


  ###
  # Create a Linked Traces file with each entity linking to one
  # or more places
  ###

  annotations = [ to_linked_trace_annotation(e) for e in dump['entities'] ] # if len(e['body']) > 0 ]
  filtered = [ a for a in annotations if len(a['body']) > 0 ]

  print(f'Dataset contains {len(filtered)} linked items')

  with open(OUTPUT_LINKED_TRACES , 'w') as outfile:
    json.dump(annotations, outfile)