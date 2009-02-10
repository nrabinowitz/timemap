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
    
    // define namespaces
    nsMap = {
        'georss':'http://www.georss.org/georss',
        'gml':'http://www.opengis.net/gml',
        'geo':'http://www.w3.org/2003/01/geo/wgs84_pos#'
    };
    
    // internal function: get tag value as a string
    var getTagValue = function(n, tag, ns) {
        var nList = getNodeList(n, tag, ns);
        if (nList.length > 0) {
            return nList[0].firstChild.nodeValue;
        } else {
            return "";
        }
    };
    
    // internal function to deal with cross-browser namespace issues
    var getNodeList = function(n, tag, ns) {
        if (ns == undefined)
            // no namespace
            return n.getElementsByTagName(tag);
        if (n.getElementsByTagNameNS)
            // function exists
            return n.getElementsByTagNameNS(nsMap[ns], tag);
        // no function, try the colon tag name
        return n.getElementsByTagName(ns + ':' + tag);
    };
    
    // internal function: make a point object from array or string
    var makePoint = function(coords) {
        var latlon;
        if (isArray(coords)) latlon = coords;
        else {
            if (coords.indexOf(',') > -1) {
                // split on commas
                latlon = coords.split(",");
            } else {
                // split on whitespace
                latlon = coords.split(/[\r\n\f ]+/);
            }
        }
        return {
            "lat": trim(latlon[0]),
            "lon": trim(latlon[1])
        };
    }
    
    // determine whether this is an Atom feed or an RSS feed
    var feedType = (node.firstChild.tagName == 'rss') ? 'rss' : 'atom';
    
    // look for placemarks
    tName = (feedType == 'rss' ? "item" : "entry");
    placemarks = node.getElementsByTagName(tName);
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
            data["start"] = d.getFullYear() + '-' 
                + ((d.getMonth() < 9) ? "0" : "") + (d.getMonth() + 1 ) + '-' 
                + ((d.getDate() < 10) ? "0" : "") + d.getDate()
                + 'T' + ((d.getHours() < 10) ? "0" : "") + d.getHours() + ':' 
                + ((d.getMinutes() < 10) ? "0" : "") + d.getMinutes() + ':' 
                + ((d.getSeconds() < 10) ? "0" : "") + d.getSeconds() + 'Z';
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