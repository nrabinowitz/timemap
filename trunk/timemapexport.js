/**---------------------------------------------------------------------------
 * TimeMap Export Functions
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * Functions in this file allow TimeMap, TimeMapDataset, and TimeMapItem
 * objects to be serialized to a JSON string suitable for loading back into
 * TimeMap.init(). This allows for a range of server-side options for
 * data persistence and management.
 * 
 * Depends on:
 * json2: lib/json2.pack.js
 *---------------------------------------------------------------------------*/

/**
 * Clean up dataset into a nice object for serialization
 * This is called automatically by the JSON.stringify() function
 *
 * Note that, at the moment, this function only supports fully-serialized
 * datasets - so external data imported with JSON or KML will be serialized
 * in full and no longer connected to their original file.
 */
TimeMapDataset.prototype.toJSON = function() {
    var data = {
        'title': this.getTitle(),
        'data': {
            'type':'basic', // only type supported by serialization at the moment
            'value': this.getItems()
        }
    };
    data = this.addExportData(data);
    return data;
}

/**
 * Specify additional data for export. Replace this function to change settings.
 *
 * @param data      Initial map of export data
 * @return          Expanded map of export data
 */
TimeMapDataset.prototype.addExportData = function(data) {
    data['options'] = data['options'] || {};
    // set any additional server info (e.g. a database key) in opts.saveOpts
    data['options']['saveOpts'] = this.opts['saveOpts'];
    return data;
}

// XXX: export items to KML with placemark.getKmlAsync?

/**
 * Clean up item into a nice object for serialization
 * This is called automatically by the JSON.stringify() function
 */
TimeMapItem.prototype.toJSON = function() {
    // any additional info (e.g. a database key) should be set in opts.saveOpts
    var data = {
        'title': this.getTitle(),
        'options': {
            'description': this.opts.description
        }
    };
    // add event info
    if (this.event) {
        data['start'] = this.event.getStart();
        if (!this.event.isInstant()) {
            data['end'] = this.event.getEnd();
        }
    }
    // add placemark info
    if (this.placemark) {
        // internal function - takes type, placemark, data
        var makePlacemarkJSON = function(type, pm, pdata) {
            // make timemap-style point objects
            var makePoint = function(latLng) {
                return {
                    'lat': latLng.lat(),
                    'lon': latLng.lng()
                }
            }
            type = type || TimeMapItem.getPlacemarkType(pm);
            switch (type) {
                case "marker":
                    pdata['point'] = makePoint(pm.getLatLng());
                    break;
                case "polyline":
                case "polygon":
                    line = [];
                    for (var x=0; x<pm.getVertexCount(); x++) {
                        line.push(makePoint(pm.getVertex(x)));
                    }
                    pdata[type] = line;
                    break;
            }
            return pdata;
        }
        if (this.getType() == 'array') {
            data['placemarks'] = [];
            for (var i=0; i<this.placemark.length; i++) {
                data['placemarks'].push(makePlacemarkJSON(false, this.placemark[i], {}));
            }
        } else {
            data = makePlacemarkJSON(this.getType(), this.placemark, data);
        }
    }
    data = this.addExportData(data);
    return data;
}

/**
 * Specify additional data for export. Replace this function to change settings.
 *
 * @param data      Initial map of export data
 * @return          Expanded map of export data
 */
TimeMapItem.prototype.addExportData = function(data) {
    data['options'] = data['options'] || {};
    // set any additional server info (e.g. a database key) in opts.saveOpts
    data['options']['saveOpts'] = this.opts['saveOpts'];
    return data;
}