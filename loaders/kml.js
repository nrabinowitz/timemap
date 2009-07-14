/*
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */
 
/*----------------------------------------------------------------------------
 * KML Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * This is a loader class for KML files. Currently supports all geometry
 * types (point, polyline, polygon, and overlay), but does not support
 * multiple geometries (i.e. multiple placemarks per item) just yet.
 *---------------------------------------------------------------------------*/

/*globals GXml, TimeMap */

/**
 * KML loader factory - inherits from remote loader
 *
 * @param {Object} options          All options for the loader:
 *   {Array} url                        URL of KML file to load (NB: must be local address)
 *   {Function} preloadFunction         Function to call on data before loading
 *   {Function} transformFunction       Function to call on individual items before loading
 */
TimeMap.loaders.kml = function(options) {
    var loader = new TimeMap.loaders.remote(options);
    loader.parse = TimeMap.loaders.kml.parse;
    return loader;
}

/*
 * Static function to parse KML with time data and load it.
 *
 * @param {XML string} kml        KML to be parsed
 */
TimeMap.loaders.kml.parse = function(kml) {
    var items = [], data, kmlnode, placemarks, pm, i;
    kmlnode = GXml.parse(kml);
    
    // get TimeMap utilty functions
    // assigning to variables should compress better
    var getTagValue = TimeMap.getTagValue,
        getNodeList = TimeMap.getNodeList,
        trim = TimeMap.trim;
    
    // recursive time data search
    var findNodeTime = function(n, data) {
        var check = false;
        // look for instant timestamp
        var nList = getNodeList(n, "TimeStamp");
        if (nList.length > 0) {
            data.start = getTagValue(nList[0], "when");
            check = true;
        }
        // otherwise look for span
        else {
            nList = getNodeList(n, "TimeSpan");
            if (nList.length > 0) {
                data.start = getTagValue(nList[0], "begin");
                data.end = getTagValue(nList[0], "end") ||
                    // unbounded spans end at the present time
                    TimeMap.formatDate(new Date());
                check = true;
            }
        }
        // try looking recursively at parent nodes
        if (!check) {
            var pn = n.parentNode;
            if (pn.nodeName == "Folder" || pn.nodeName=="Document") {
                findNodeTime(pn, data);
            }
            pn = null;
        }
    };
    
    // look for placemarks
    placemarks = getNodeList(kmlnode, "Placemark");
    for (i=0; i<placemarks.length; i++) {
        pm = placemarks[i];
        data = { options: {} };
        // get title & description
        data.title = getTagValue(pm, "name");
        data.options.description = getTagValue(pm, "description");
        // get time information
        findNodeTime(pm, data);
        // find placemark
        PLACEMARK: {
            var nList, coords, coordArr, latlon, geom;
            // look for marker
            nList = getNodeList(pm, "Point");
            if (nList.length > 0) {
                data.point = {};
                // get lat/lon
                coords = getTagValue(nList[0], "coordinates");
                latlon = coords.split(",");
                data.point = {
                    "lat": trim(latlon[1]),
                    "lon": trim(latlon[0])
                };
                break PLACEMARK;
            }
            // look for polylines and polygons
            nList = getNodeList(pm, "LineString");
            if (nList.length > 0) {
                geom = "polyline";
            } else {
                nList = getNodeList(pm, "Polygon");
                if (nList.length > 0) {
                    geom = "polygon";
                }
            }
            if (nList.length > 0) {
                data[geom] = [];
                coords = getTagValue(nList[0], "coordinates");
                coordArr = trim(coords).split(/[\r\n\f ]+/);
                for (var x=0; x<coordArr.length; x++) {
                    latlon = coordArr[x].split(",");
                    data[geom].push({
                        "lat": trim(latlon[1]),
                        "lon": trim(latlon[0])
                    });
                }
                break PLACEMARK;
            }
        }
        items.push(data);
    }
    
    // look for ground overlays
    placemarks = getNodeList(kmlnode, "GroundOverlay");
    for (i=0; i<placemarks.length; i++) {
        pm = placemarks[i];
        data = { options: {}, overlay: {} };
        // get title & description
        data.title = getTagValue(pm, "name");
        data.options.description = getTagValue(pm, "description");
        // get time information
        findNodeTime(pm, data);
        // get image
        nList = getNodeList(pm, "Icon");
        data.overlay.image = getTagValue(nList[0], "href");
        // get coordinates
        nList = getNodeList(pm, "LatLonBox");
        data.overlay.north = getTagValue(nList[0], "north");
        data.overlay.south = getTagValue(nList[0], "south");
        data.overlay.east = getTagValue(nList[0], "east");
        data.overlay.west = getTagValue(nList[0], "west");
        items.push(data);
    }
    
    // clean up
    kmlnode = null;
    placemarks = null;
    pm = null;
    nList = null;
    return items;
};
