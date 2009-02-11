/*
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */
 
/*----------------------------------------------------------------------------
 * KML Parser
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * This is a function for parsing KML files. Currently supports all geometry
 * types (point, polyline, polygon, and overlay), but does not support
 * multiple geometries (i.e. multiple placemarks per item) just yet.
 *---------------------------------------------------------------------------*/

/*
 * Static function to parse KML with time data and load it.
 *
 * @param {XML text} kml        KML to be parsed
 */
TimeMapDataset.parseKML = function(kml) {
    var items = [], data, kmlnode, placemarks, pm;
    kmlnode = GXml.parse(kml);
    
    // convenience function: get tag value as a string
    var getTagValue = function(n, tag) {
        var nList = n.getElementsByTagName(tag);
        if (nList.length > 0) {
            return nList[0].firstChild.nodeValue;
        } else {
            return "";
        }
    }
    
    // recursive time data search
    var findNodeTime = function(n, data) {
        var check = false;
        // look for instant timestamp
        nList = n.getElementsByTagName("TimeStamp");
        if (nList.length > 0) {
            data["start"] = getTagValue(nList[0], "when");
            check = true;
        }
        // otherwise look for span
        else {
            nList = n.getElementsByTagName("TimeSpan");
            if (nList.length > 0) {
                data["start"] = getTagValue(nList[0], "begin");
                data["end"] = getTagValue(nList[0], "end");
                check = true;
            }
        }
        // try looking recursively at parent nodes
        if (!check) {
            var pn = n.parentNode;
            if (pn.nodename == "Folder" || pn.nodename=="Document") {
                TimeMapDataset.findNodeTime(pn, data);
            }
            pn = null;
        }
    }
    
    // look for placemarks
    placemarks = kmlnode.getElementsByTagName("Placemark");
    for (var i=0; i<placemarks.length; i++) {
        pm = placemarks[i];
        data = { options: {} };
        // get title & description
        data["title"] = getTagValue(pm, "name");
        data.options["description"] = getTagValue(pm, "description");
        // get time information
        findNodeTime(pm, data);
        // find placemark
        PLACEMARK: {
            var coords, coordArr, latlon, geom;
            // look for marker
            nList = pm.getElementsByTagName("Point");
            if (nList.length > 0) {
                data["point"] = {};
                // get lat/lon
                coords = getTagValue(nList[0], "coordinates");
                latlon = coords.split(",");
                data["point"] = {
                    "lat": trim(latlon[1]),
                    "lon": trim(latlon[0])
                };
                break PLACEMARK;
            }
            // look for polylines and polygons
            nList = pm.getElementsByTagName("LineString");
            if (nList.length > 0) {
                geom = "polyline";
            } else {
                nList = pm.getElementsByTagName("Polygon");
                if (nList.length > 0) geom = "polygon";
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
    placemarks = kmlnode.getElementsByTagName("GroundOverlay");
    for (var i=0; i<placemarks.length; i++) {
        pm = placemarks[i];
        data = { options: {}, overlay: {} };
        // get title & description
        data["title"] = getTagValue(pm, "name");
        data.options["description"] = getTagValue(pm, "description");
        // get time information
        findNodeTime(pm, data);
        // get image
        nList = pm.getElementsByTagName("Icon");
        data.overlay["image"] = getTagValue(nList[0], "href");
        // get coordinates
        nList = pm.getElementsByTagName("LatLonBox");
        data.overlay["north"] = getTagValue(nList[0], "north");
        data.overlay["south"] = getTagValue(nList[0], "south");
        data.overlay["east"] = getTagValue(nList[0], "east");
        data.overlay["west"] = getTagValue(nList[0], "west");
        items.push(data);
    }
    
    // clean up
    kmlnode = null;
    placemarks = null;
    pm = null;
    nList = null;
    return items;
}