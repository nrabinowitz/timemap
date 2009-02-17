/*
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */
 
/*----------------------------------------------------------------------------
 * GeoRSS Parser
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * This is a function for parsing GeoRSS feeds. Parsing is complicated by the 
 * diversity of GeoRSS formats; this parser handles:
 * - RSS feeds
 * - Atom feeds
 * and looks for geographic information in the following formats:
 * - GeoRSS-Simple
 * - GML 
 * - W3C Geo
 *
 * At the moment, this only supports points; polygons, polylines, and boxes
 * will be added at some later point.
 *---------------------------------------------------------------------------*/


/*
 * Static function to parse GeoRSS and load it.
 *
 * @param {XML text} rss        GeoRSS to be parsed
 */
TimeMapDataset.parseGeoRSS = function(rss) {
    var items = [], data, node, placemarks, pm;
    node = GXml.parse(rss);
    
    // get TimeMap utilty functions
    // assigning to variables should compress better
    var getTagValue = TimeMap.getTagValue,
        getNodeList = TimeMap.getNodeList,
        makePoint = TimeMap.makePoint,
        trim = TimeMap.trim;
    
    // define namespaces
    TimeMap.nsMap['georss'] = 'http://www.georss.org/georss';
    TimeMap.nsMap['gml'] = 'http://www.opengis.net/gml';
    TimeMap.nsMap['geo'] = 'http://www.w3.org/2003/01/geo/wgs84_pos#';
    
    // determine whether this is an Atom feed or an RSS feed
    var feedType = (node.firstChild.tagName == 'rss') ? 'rss' : 'atom';
    
    // look for placemarks
    tName = (feedType == 'rss' ? "item" : "entry");
    placemarks = getNodeList(node, tName);
    for (var i=0; i<placemarks.length; i++) {
        pm = placemarks[i];
        data = { options: {} };
        // get title & description
        data["title"] = getTagValue(pm, "title");
        tName = (feedType == 'rss' ? "description" : "summary");
        data.options["description"] = getTagValue(pm, tName);
        // get time information
        if (feedType == 'rss') {
            // RSS needs date conversion
            var d = new Date(Date.parse(getTagValue(pm, "pubDate")));
            // reformat
            data["start"] = TimeMap.formatDate(d);
        } else {
            // atom uses ISO 8601
            data["start"] = getTagValue(pm, "updated");
        }
        // find placemark - single geometry only for the moment
        PLACEMARK: {
            var coords, coordArr, latlon, geom;
            // look for point, GeoRSS-Simple
            coords = getTagValue(pm, "point", 'georss');
            if (coords) {
                data["point"] = makePoint(coords); 
                break PLACEMARK;
            }
            // look for point, GML
            nList = getNodeList(pm, "Point", 'gml');
            if (nList.length > 0) {
                // GML <pos>
                coords = getTagValue(nList[0], "pos", 'gml');
                // GML <coordinates>
                if (!coords) coords = getTagValue(nList[0], "coordinates", 'gml');
                if (coords) {
                    data["point"] = makePoint(coords); 
                    break PLACEMARK;
                }
            }
            // look for point, W3C Geo
            if (getTagValue(pm, "lat", 'geo')) {
                coords = [
                    getTagValue(pm, "lat", 'geo'),
                    getTagValue(pm, "long", 'geo')
                ];
                data["point"] = makePoint(coords); 
                break PLACEMARK;
            }
            
            // XXX: look for polylines, polygons, and boxes
        }
        items.push(data);
    }
    
    // clean up
    node = null;
    placemarks = null;
    pm = null;
    nList = null;
    return items;
}