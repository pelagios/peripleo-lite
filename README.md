# Peripleo Lite

A JavaScript viewer for geospatial linked data. __Work in progress!__

## Setup and build

> We do not (yet!) provide a pre-built package for Peripleo Lite. For the time
> being, you need to build your own JS distribution file, or run Peripleo Lite
> in development mode.

### Requirements

You need a recent version of [node.js](https://nodejs.org/) and
[npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) installed
on your system.

1. Clone this repository
2. Run `npm install` to install library dependencies

### To build a distribution 

Run `npm run build`. The result file will be in `dist/peripleo.js`.

### To run in development mode

Run `npm start`. Your browser should open automatically on <http://localhost:3000>.

## Using with your own data

Peripleo Lite supports data in the following formats:

- Gazetteer data in [Linked Places](https://github.com/LinkedPasts/linked-places-format) format
- LOD datasets in [Linked Traces](https://github.com/LinkedPasts/linked-traces-format) annotation format
- A - currently experimental - combination of [TEI](https://tei-c.org/) and Linked Traces. (Get in touch with us if you want to know more!)

The datasets to load at startup are defined in the
[peripleo.config.json](https://github.com/pelagios/peripleo-lite/blob/main/public/peripleo.config.json) 
file. Modify this according to your needs. Example:

```json
{
  "data": [
    { "name": "ToposText",      "format": "LINKED_PLACES", "src": "data/topostext-places.lp.json" },
    { "name": "Pleiades",       "format": "LINKED_PLACES", "src": "data/pleiades-places.lp.json" },
    { "name": "iDAI.gazetteer", "format": "LINKED_PLACES", "src": "data/arachne-pausanias-places.lp.json" },
    { "name": "ASCSA Agora",    "format": "LINKED_PLACES", "src": "data/ascsa-monuments-places.lp.json" },
    { "name": "J. Binder Monuments and Places (Subset)", "format": "LINKED_PLACES", "src": "data/jbinder-athens-paus.lp.json" },    
    { "name": "Arachne Monuments", "format": "LINKED_TRACES", "src": "data/arachne-pausanias-traces.lt.json" },

    { 
      "name": "Pausanias Book 1", 
      "format": "TEI+LINKED_TRACES", 
      "trace": "data/pausanias-book1.jsonld",
      "tei": "data/pausanias-book1.tei.xml",
      "prefix": "http://recogito.humlab.umu.se/annotation/"
    }
  ] 
}
```