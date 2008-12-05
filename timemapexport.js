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
 * Clean up TimeMap into a nice object for serialization
 * This is called automatically by the JSON.stringify() function
 */
TimeMap.prototype.toJSON = function() {
    var data = {
        'options': this.makeOptionData,
        'datasets': this.datasets
    }
    data = this.addExportData(data);
}

/**
 * Make a cleaned up object for the TimeMap options
 */
TimeMap.prototype.makeOptionData = function() {
    var data = this.opts;
    // clean up: mapCenter
    if (data['mapCenter']) data['mapCenter'] = TimeMap.makePoint(data['mapCenter']);
    // clean up: mapType
    if (data['mapType']) data['mapType'] = revHash(TimeMap.mapTypes, data['mapType']);
    // clean up: mapTypes
    if (data['mapTypes']) {
        var mts=[], mt;
        for (var x=0; x<data['mapTypes'].length; x++) {
            mt = revHash(TimeMap.mapTypes, data['mapTypes'][x]);
            if (mt) mts.push(mt);
        }
        data['mapTypes'] = mts;
    }
    // clean up: bandIntervals
    if (data['bandIntervals']) data['bandIntervals'] = revHash(TimeMap.intervals, data['bandIntervals']);
    return data;
}

/**
 * Specify additional data for export. Replace this function to change settings.
 *
 * @param data      Initial map of export data
 * @return          Expanded map of export data
 */
TimeMap.prototype.addExportData = function(data) {
    data['options'] = data['options'] || {};
    // set any additional server info (e.g. a database key) in opts.saveOpts
    data['options']['saveOpts'] = this.opts['saveOpts'];
    return data;
}

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
            type = type || TimeMapItem.getPlacemarkType(pm);
            switch (type) {
                case "marker":
                    pdata['point'] = TimeMap.makePoint(pm.getLatLng());
                    break;
                case "polyline":
                case "polygon":
                    line = [];
                    for (var x=0; x<pm.getVertexCount(); x++) {
                        line.push(TimeMap.makePoint(pm.getVertex(x)));
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

/**
 * Make TimeMap.init()-style points from a GLatLng
 *
 * @param (GLatLng) latLng      GLatLng to convert
 * @return (Object)
 */
TimeMap.makePoint = function(latLng) {
    return {
        'lat': latLng.lat(),
        'lon': latLng.lng()
    }
}

/**
 * Util function: get the key from the map if the val is found
 *
 * @param (Object) map      Object to search
 * @param (?) val           Value to look for
 * @return (String)         Key if found, null if not
 */
function revHash(map, val) {
    for (k in map)
        if (map[k] == val)
            return k;
    // nothing found
    return null;
} 