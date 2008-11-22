/**---------------------------------------------------------------------------
 * TimeMap Export Functions
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * Functions in this file allow TimeMap, TimeMapDataset, and TimeMapItem
 * objects to be serialized to a JSON string suitable for loading back into
 * timemapInit(). This allows for a range of server-side options for
 * data persistence and management
 * 
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
    // any additional info (e.g. a database key) should be set in opts.saveOpts
    var data = {
        'title': this.getTitle(),
        'data': {
            'type':'basic', // only type supported by serialization at the moment
            'value': this.getItems()
        }
    };
    return data;
}

/**
 * Clean up item into a nice object for serialization
 * This is called automatically by the JSON.stringify() function
 */
TimeMapItem.prototype.toJSON = function() {
    // any additional info (e.g. a database key) should be set in opts.saveOpts
    var data = {
        'title': this.getTitle(),
        'options': {
            'saveOpts': this.opts.saveOpts,
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
    // add placemark info (only single placemarks supported at the moment)
    if (this.placemark) {
        var makePoint = function(latLng) {
            return {
                'lat': latLng.lat(),
                'lon': latLng.lng()
            }
        }
        switch (this.getType()) {
            case "marker":
                data['point'] = makePoint(this.placemark.getLatLng());
                break;
            case "polyline":
            case "polygon":
                line = [];
                for (var x=0; x<this.placemark.getVertexCount(); x++) {
                    line.push(makePoint(this.placemark.getVertex(x)));
                }
                data[this.getType()] = line;
                break;
        }
    }
    return data;
}