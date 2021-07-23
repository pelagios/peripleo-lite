/**
 * A start to support when-json, as far as it's being used in our
 * datasets. Example from ToposText:
 * 
 *  "when": {
 *    "timespans": [
 *      {
 *        "start": {
 *          "in": "-750"
 *        },
 *        "end": {
 *          "in": "0640"
 *        }
 *      }
 *    ],
 *    "label": "Greco-Roman civilization, 750 BCE - 640 CE"
 *  },
 */
export default class When {

  constructor(strOrObj) {
    if (typeof strOrObj === 'string' || strOrObj.start || strOrObj.end ) {
      this._parseShorthand(strOrObj);
    } else if (strOrObj.timespans) { // TODO extend
      this._parseFullObject(strOrObj);      
    } else {
      throw new Error(`Invalid when object: ${JSON.stringify(strOrObj)}`);
    }

    this._when = strOrObj; // Keep original
  }

  _parseShorthand(strOrObj) {
    // TODO
  }

  _parseFullObject(obj) {
    this._timespans = obj.timespans;

    // TODO validation: 
    // TODO  - make sure timespans are dates
    // TODO  - make sure start is < end

    // Normalized properties
    this._earliest = obj.timespans
      .reduce((earliest, ts) => {
        return (earliest && earliest < ts.start) ? earliest : ts.start.in;
      }, null);

    this._latest = obj.timespans
      .reduce((latest, ts) => {
        return (latest && latest > ts.end) ? latest : ts.end.in;
      }, null);
  }

  get start() {
    return this._earliest;
  }

  get end() {
    return this._latest;
  }

  get intervals() {
    // TODO should we normalize intervals?
    return this._timespans.map(ts => [ ts.start.in, ts.end.in ]);
  }

  get label() {
    return this._when.label;
  }

}