/*----------------------------------------------------------------------------
 * TimeMap v. 1.0 
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * The TimeMap object is intended to sync a SIMILE Timeline with a Google Map.
 * Dependencies: Google Maps API v2, SIMILE Timeline v1.2
 * Thanks to Jörn Clausen (http://www.oe-files.de) for initial concept and code.
 *
 * Copyright 2008 Nick Rabinowitz.
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details. 
 * See <http://www.gnu.org/licenses/>.
 *
 * $Id: timemap.js,v 1.94 2008/01/28 00:51:31 nickrabi Exp $
 *---------------------------------------------------------------------------*/

 
/*----------------------------------------------------------------------------
 * TimeMap Class - holds references to timeline, map, and datasets
 *---------------------------------------------------------------------------*/
 
/**
 * Creates a new TimeMap with map placemarks synched to timeline events
 * This will create the visible map, but not the timeline, which must be initialized separately.
 *
 * @constructor
 * @param {element} tElement     The timeline element.
 * @param {element} mElement     The map element.
 * @param {Object} options       A container for optional arguments:
 *   {Boolean} syncBands            Whether to synchronize all bands in timeline
 *   {GLatLng} mapCenter            Point for map center
 *   {Number} mapZoom               Intial map zoom level
 *   {GMapType} mapType             The maptype for the map
 *   {Boolean} showMapTypeCtrl      Whether to display the map type control
 *   {Boolean} showMapCtrl          Whether to show map navigation control
 *   {Boolean} hidePastFuture       Whether to hide map placemarks for events not visible on timeline
 *   {Boolean} hideOffMap           Whether to hide events for map placemarks not visible on map
 *   {Boolean} centerMapOnItems     Whether to center and zoom the map based on loaded item positions
 */
function TimeMap(tElement, mElement, options) {
    // save elements
    this.mElement = mElement;
    this.tElement = tElement;
    // initialize array of datasets
    this.datasets = {};
    // initialize map bounds
    this.mapBounds = new GLatLngBounds();
    
    // default settings, can be overridden by options
    // other options can be set directly on the map or timeline
    this.settings = {
        syncBands : ("syncBands" in options) ? options.syncBands : 
            true,
        mapCenter : ("mapCenter" in options) ? options.mapCenter : 
            new GLatLng(0,0), 
        mapZoom : ("mapZoom" in options) ? options.mapZoom : 
            4,
        mapType : ("mapType" in options) ? options.mapType : 
            G_PHYSICAL_MAP,
        showMapTypeCtrl : ("showMapTypeCtrl" in options) ? options.showMapTypeCtrl : 
            true,
        showMapCtrl : ("showMapCtrl" in options) ? options.showMapCtrl : 
            true,
        hidePastFuture : ("hidePastFuture" in options) ? options.hidePastFuture : 
            true,
        hideOffMap : ("hideOffMap" in options) ? options.hideOffMap : 
            false, // I don't like the way this works, really
        centerMapOnItems : ("centerMapOnItems" in options) ? options.centerMapOnItems : 
            true
    };
    
    // initialize map
    var s = this.settings;
    if (GBrowserIsCompatible()) {
        this.map = new GMap2(this.mElement);
        if (s.showMapCtrl)
            this.map.addControl(new GLargeMapControl());
        if (s.showMapTypeCtrl)
            this.map.addControl(new GMapTypeControl());
        this.map.addMapType(G_PHYSICAL_MAP);
        this.map.removeMapType(G_HYBRID_MAP);
        this.map.enableDoubleClickZoom();
        this.map.enableScrollWheelZoom();
        this.map.enableContinuousZoom();
        // initialize map center and zoom
        this.map.setCenter(s.mapCenter, s.mapZoom);
        // must be called after setCenter, for reasons unclear
        this.map.setMapType(s.mapType);
    }
    
    // hijack popup window callback to show map info window
    var oMap = this.map;
    Timeline.DurationEventPainter.prototype._showBubble = function(x, y, evt) {
        GEvent.trigger(evt.placemark, 'click');
    }
}

/**
 * Create an empty dataset object and add it to the timemap
 *
 * @param {String} id               The id of the dataset
 * @param {Object} options          A container for optional arguments:
 */
TimeMap.prototype.createDataset = function(id, options) {
    if(!("title" in options)) options.title = id;
    var dataset = new TimeMapDataset(this, options);
    this.datasets[id] = dataset;
    return dataset;
}

/**
 * Initialize the timeline - this must happen separately to allow full control of 
 * timeline properties.
 *
 * @param {BandInfo Array} bands    Array of band information objects for timeline
 */
TimeMap.prototype.initTimeline = function(bands) {
    
    // synchronize & highlight timeline bands
    for (var x=1; x < bands.length; x++) {
        if (this.settings.syncBands)
            bands[x].syncWith = (x-1);
        bands[x].highlight = true;
    }
    
    // initialize timeline
    this.timeline = Timeline.create(this.tElement, bands);
    
    // set event listener to hide off-timeline items on the map
    if (this.settings.hidePastFuture) {
        var topband = this.timeline.getBand(0);
        var datasets = this.datasets;
        var oMap = this.map;
        topband.addOnScrollListener(function() {
            var maxVisibleDate = topband.getMaxVisibleDate().getTime();
            var minVisibleDate = topband.getMinVisibleDate().getTime();
            for (id in datasets) {
                var items = datasets[id].getItems();
                for (var x=0; x < items.length; x++) {
                    if (items[x].event != null) {
                        var itemStart = items[x].event.getStart().getTime();
                        var itemEnd = items[x].event.getEnd().getTime();
                        // hide items in the future
                        if (itemStart > maxVisibleDate) {
                            items[x].placemark.hide();
                            items[x].closeInfoWindow();
                        } 
                        // hide items in the past
                        else if (itemEnd < minVisibleDate || 
                            (items[x].event.isInstant() && itemStart < minVisibleDate)) {
                            items[x].placemark.hide();
                            items[x].closeInfoWindow();
                        } 
                        else items[x].placemark.show();
                    }
                }
            }
        });
    }
    
    // set event listener to hide off-map items on the timeline
    if (this.settings.hideOffMap) {
        var datasets = this.datasets;
        var oMap = this.map;
        GEvent.addListener(oMap, "moveend", function() {
            var bounds = oMap.getBounds();
            for (id in datasets) {
                var items = datasets[id].getItems();
                for (var x=0; x < items.length; x++) {
                    var placemarkPoint = items[x].placemark.getLatLng();
                    // hide events outside map bounds
                    if (!bounds.containsLatLng(placemarkPoint) && items[x].event != null)
                        items[x].event.hide();
                    else items[x].event.show();
                }
            }
        });
    }
    
    // add callback for window resize here instead of the html file, to conform with XHTML 1.0
    resizeTimerID = null;
    var oTImeline = this.timeline;
    window.onresize = function() {
        if (resizeTimerID == null) {
            resizeTimerID = window.setTimeout(function() {
                resizeTimerID = null;
                oTImeline.layout();
            }, 500);
        }
    };
};

/**
 * Create a legend with the current datasets, using an existing DOM element.
 * This relies on the color property being set for each dataset
 * XXX: still depends on jQuery...
 *
 * @param {String} legendId        The id of the legend element.
 */
TimeMap.prototype.createLegend = function(legendId) {
    legendId = "#"+legendId;
    for (id in this.datasets) {
        var dataset = this.datasets[id];
        var colorBox = '<div style="float:left;margin-right:5px;border:1px solid #000;width:12px;height:12px;background:' + dataset._theme.color + '">&nbsp;</div>';
        var divHtml = '<div class="legenditem">' + colorBox+dataset.title + '</div>';
        $(legendId).append(divHtml);
    }
}

/*----------------------------------------------------------------------------
 * TimeMapDataset Class - holds references to items and visual themes
 *---------------------------------------------------------------------------*/

/**
 * Create a new TimeMap dataset to hold a set of items
 *
 * @constructor
 * @param {TimeMap} timemap             Reference to the timemap object
 * @param {Object} options              Object holding optional arguments:
 *      {String} title                      Title of the dataset (for the legend)
 *      {TimeMapDatasetTheme}  theme        Theme settings
 *
 */
function TimeMapDataset(timemap, options) {
    // hold reference to timemap
    this.timemap = timemap;
    // initialize timeline event source
    this.eventSource = new Timeline.DefaultEventSource();
    // initialize array of items
    this._items = [];
    // initialize vars
    this.title = ("title" in options) ? options.title : "";
    this._theme = ("theme" in options) ? options.theme : new TimeMapDatasetTheme({});
}

/*
 * Get the items for this dataset
 */
TimeMapDataset.prototype.getItems = function() {
    return this._items;
}


/*
 * Add items to map and timeline. 
 * Each item has both a timeline event and a map placemark.
 *
 * @param {Object} data             Data to be loaded, in the following format:
 *        {String} title                Title of the item (visible on timeline and info window)
 *        {Iso8601DateTime} start       Start time of the event on the timeline
 *        {Iso8601DateTime} end         End time of the event on the timeline (duration events only)
 *        {String} description          Description to be shown in the info window
 *        {Object} point                Data for a single-point placemark: 
 *          {Float} lat                   Latitude of map marker
 *          {Float} lon                   Longitude of map marker
 *        {Array of points} polyline    Data for a polyline placemark, in format above
 *        {Array of points} polygon     Data for a polygon placemark, in format above
 * @param {Function} transform      If data is not in the above format, transformation function to make it so
 */
TimeMapDataset.prototype.loadItems = function(data, transform) {
    for (var x=0; x < data.length; x++) {
        this.loadItem(data[x], transform);
    }
    var tm = this.timemap;
    // XXX - probably change to this.timemap.onLoadItems()
    if  (tm.settings.centerMapOnItems) {
        // determine the zoom level from the bounds
        tm.map.setZoom(tm.map.getBoundsZoomLevel(tm.mapBounds));
        // determine the center from the bounds
        tm.map.setCenter(tm.mapBounds.getCenter());
    }
};

/*
 * Add one item to map and timeline. 
 * Each item has both a timeline event and a map placemark.
 *
 * @param {Object} data             Data to be loaded, in the following format:
 *      {String} title                  Title of the item (visible on timeline and info window)
 *      {Iso8601DateTime} start         Start time of the event on the timeline
 *      {Iso8601DateTime} end           End time of the event on the timeline (duration events only)
 *      {Object} point                  Data for a single-point placemark: 
 *          {Float} lat                   Latitude of map marker
 *          {Float} lon                   Longitude of map marker
 *      {Array of points} polyline      Data for a polyline placemark, in format above
 *      {Array of points} polygon       Data for a polygon placemark, in format above
 *      {Object} options                Optional arguments to be passed to the TimeMapItem:
 *          {String} description            Description to be shown in the info window
 *          {String} infoHtml               Full HTML for the info window
 *          {String} infoUrl                URL from which to retrieve full HTML for the info window
 *          {String} maxInfoHtml            Full HTML for the maximized info window
 *          {String} maxInfoUrl             URL from which to retrieve full HTML for the maximized info window
 *          {String} maxOnly                Whether to auto-maximize on open
 * @param {Function} transform      If data is not in the above format, transformation function to make it so
 */
TimeMapDataset.prototype.loadItem = function(data, transform) {
    // apply transformation, if any
    if (transform != undefined)
        data = transform(data);
    // transform functions can return a null value to skip a datum in the set
    if (data == null) return;
    
    var tm = this.timemap;
    
    // create timeline event
    var start = (data.start == undefined||data.start == "") ? null :
        Timeline.DateTime.parseIso8601DateTime(data.start);
    var end = (data.end == undefined||data.end == "") ? null : 
        Timeline.DateTime.parseIso8601DateTime(data.end);
    var instant = (data.end == undefined);
    var eventIcon = instant ? this._theme.eventIcon : null;
    var title = data.title;
    // allow event-less placemarks - these will be always present
    if (start != null)
        var event = new Timeline.DefaultEventSource.Event(start, end, null, null,
                                                      instant, title, null, null, null, 
                                                      eventIcon, this._theme.eventColor, null);
    else var event = null;
    
    // create map placemark
    var placemark = null;
    var type = "";
    var point = null;
    // point placemark
    if ("point" in data) {
        point = new GLatLng(
            parseFloat(data.point["lat"]), 
            parseFloat(data.point["lon"])
        );
        // add point to visible map bounds
        if (tm.settings.centerMapOnItems) {
            tm.mapBounds.extend(point);
        }
        placemark = new GMarker(point, { icon: this._theme.icon });
        type = "marker";
    } else if ("polyline" in data || "polygon" in data) {
        var points = [];
        if ("polyline" in data)
            var line = data.polyline;
        else var line = data.polygon;
        for (var x=0; x<line.length; x++) {
            point = new GLatLng(
                parseFloat(line[x]["lat"]), 
                parseFloat(line[x]["lon"])
            );
            points.push(point);
            // add point to visible map bounds
            if (tm.settings.centerMapOnItems) {
                tm.mapBounds.extend(point);
            }
        }
        if ("polyline" in data) {
            placemark = new GPolyline(points, 
                                      this._theme.lineColor, 
                                      this._theme.lineWeight,
                                      this._theme.lineOpacity);
            type = "polyline";
        } else {
            placemark = new GPolygon(points, 
                                     this._theme.polygonLineColor, 
                                     this._theme.polygonLineWeight,
                                     this._theme.polygonLineOpacity,
                                     this._theme.fillColor,
                                     this._theme.fillOpacity);
            type = "polygon";
        }
    }
    
    // define the center point of this item
    if (type == "marker") {
        // just the marker point
        point = placemark.getLatLng();
    } else if (type == "polyline") {
        // the middle vertex of the line
        point = placemark.getVertex(Math.floor(placemark.getVertexCount()/2));
    } else if (type == "polygon") {
        // the middle of the polygon bounds
        point = placemark.getBounds().getCenter();
    }
    
    var options = ("options" in data) ? data.options : {};
    options["title"] = title;
    options["type"] = type;
    options["infoPoint"] = point;
    
    // create cross-references
    var item = new TimeMapItem(placemark, event, tm.map, options);
    if (event != null) {
        event.placemark = placemark;
        event.item = item;
    }
    placemark.event = event;
    placemark.item = item;
    
    this._items.push(item);
    
    // add listener to make placemark open when event is clicked
    // XXX: Will need to think about how to make this work w/Ajax
    var oMap = tm.map;
    GEvent.addListener(placemark, "click", function() {
        item.openInfoWindow();
    });
    
    // add placemark and event to map and timeline
    tm.map.addOverlay(placemark);
    if (event != null)
        this.eventSource.add(event);
};

/*
 * Static function to parse KML with time data and load it.
 * !! This depends on jQuery, and possibly even jQuery 1.2.2!
 *
 * @param {XML text} kml        KML to be parsed
 */
TimeMapDataset.parseKML = function(kml) {
    var items = [];
    kmlnode = GXml.parse(kml);
    var placemarks = kmlnode.getElementsByTagName("Placemark");
    for (var i=0; i<placemarks.length; i++) {
        var pm = placemarks[i];
        var nList, data = {};
        // get title
        nList = pm.getElementsByTagName("name");
        if (nList.length > 0) {
            data["title"] = nList[0].firstChild.nodeValue;
        }
        // get description
        nList = pm.getElementsByTagName("description");
        data["options"] = {};
        if (nList.length > 0) {
            data["options"]["description"] = nList[0].firstChild.nodeValue;
        }
        // look for instant timestamp
        nList = pm.getElementsByTagName("TimeStamp");
        if (nList.length > 0) {
            data["start"] = nList[0].getElementsByTagName("when")[0].firstChild.nodeValue;
        }
        // otherwise look for span
        if (!data["start"]) {
            nList = pm.getElementsByTagName("TimeSpan");
            if (nList.length > 0) {
                data["start"] = nList[0].getElementsByTagName("begin")[0].firstChild.nodeValue;
                data["end"] = nList[0].getElementsByTagName("end")[0].firstChild.nodeValue;
            }
        }
        // look for marker
        nList = pm.getElementsByTagName("Point");
        if (nList.length > 0) {
            data["point"] = {};
            // get lat/lon
            var coords = nList[0].getElementsByTagName("coordinates")[0].firstChild.nodeValue;
            var latlon = coords.split(",");
            data["point"] = {
                "lat": trim(latlon[1]),
                "lon": trim(latlon[0])
            };
        }
        // look for polyline / polygon
        else {
            nList = pm.getElementsByTagName("LineString");
            if (nList.length > 0) {
                data["polyline"] = [];
                var coords = nList[0].getElementsByTagName("coordinates")[0].firstChild.nodeValue;
                var coordArr = trim(coords).split(/[\r\n\f]+/);
                for (var x=0; x<coordArr.length; x++) {
                    var latlon = coordArr[x].split(",");
                    data["polyline"].push({
                        "lat": trim(latlon[1]),
                        "lon": trim(latlon[0])
                    });
                }
            } else {
                nList = pm.getElementsByTagName("Polygon");
                if (nList.length > 0) {
                    data["polyline"] = [];
                    var coords = nList[0].getElementsByTagName("coordinates")[0].firstChild.nodeValue;
                    var coordArr = trim(coords).split(/[\r\n\f]+/);
                    for (var x=0; x<coordArr.length; x++) {
                        var latlon = coordArr[x].split(",");
                        data["polyline"].push({
                            "lat": trim(latlon[1]),
                            "lon": trim(latlon[0])
                        });
                    }
                }
            }
        }
        items.push(data);
    }
    kmlnode = null;
    nList = null;
    return items;
}

/*----------------------------------------------------------------------------
 * Predefined visual themes for datasets, based on Google markers
 *---------------------------------------------------------------------------*/
 
/**
 * Create a new theme for a TimeMap dataset, defining colors and images
 *
 * @constructor
 * @param {Object} options          A container for optional arguments:
 *      {GIcon} icon                    Icon for marker placemarks
 *      {String} color                  Default color in hex for events, polylines, polygons
 *      {String} lineColor              Color for polylines, defaults to options.color
 *      {String} polygonLineColor       Color for polygon outlines, defaults to lineColor
 *      {Number} lineOpacity            Opacity for polylines
 *      {Number} polgonLineOpacity      Opacity for polygon outlines, defaults to options.lineOpacity
 *      {Number} lineWeight             Line weight in pixels for polylines
 *      {Number} polygonLineWeight      Line weight for polygon outlines, defaults to options.lineWeight
 *      {String} fillColor              Color for polygon fill, defaults to options.color
 *      {String} fillOpacity            Opacity for polygon fill
 *      {String} eventColor             Background color for duration events
 *      {URL} eventIcon                 Icon URL for instant events
 */
function TimeMapDatasetTheme(options) {
    // work out various defaults - the default theme is Google's reddish color
    this.icon = ("icon" in options) ? options.icon : 
        G_DEFAULT_ICON;
    this.color = ("color" in options) ? options.color : 
        "#FE766A";
    this.lineColor = ("lineColor" in options) ? options.lineColor : 
        this.color;
    this.polygonLineColor = ("polygonLineColor" in options) ? options.polygonLineColor : 
        this.lineColor;
    this.lineOpacity = ("lineOpacity" in options) ? options.lineOpacity : 
        1;
    this.polgonLineOpacity = ("polgonLineOpacity" in options) ? options.polgonLineOpacity : 
        this.lineOpacity;
    this.lineWeight = ("lineWeight" in options) ? options.lineWeight : 
        2;
    this.polygonLineWeight = ("polygonLineWeight" in options) ? options.polygonLineWeight : 
        this.lineWeight;
    this.fillColor = ("fillColor" in options) ? options.fillColor : 
        this.color;
    this.fillOpacity = ("fillOpacity" in options) ? options.fillOpacity : 
        0.25;
    this.eventColor = ("eventColor" in options) ? options.eventColor : 
        this.color;
    this.eventIcon = ("eventIcon" in options) ? options.eventIcon : 
        "timemap/images/red-circle.png"; // XXX: probably need to work out the URLs better here
}

TimeMapDataset.redTheme = function() {
    return new TimeMapDatasetTheme({});
}

TimeMapDataset.blueTheme = function() {
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/blue-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    return new TimeMapDatasetTheme({
        icon: markerIcon, 
        color: "#5A7ACF",
        eventIcon: "timemap/images/blue-circle.png"
    });
}

TimeMapDataset.greenTheme = function() {
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/green-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    return new TimeMapDatasetTheme({
        icon: markerIcon, 
        color: "#19CF54",
        eventIcon: "timemap/images/green-circle.png"
    });
}

TimeMapDataset.ltblueTheme = function() {
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/ltblue-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    return new TimeMapDatasetTheme({
        icon: markerIcon, 
        color: "#5ACFCF",
        eventIcon: "timemap/images/ltblue-circle.png"
    });
}

TimeMapDataset.purpleTheme = function() {
    // marker icon
    var markerIcon = new GIcon(G_DEFAULT_ICON);
    markerIcon.image = "http://www.google.com/intl/en_us/mapfiles/ms/icons/purple-dot.png";
    markerIcon.iconSize = new GSize(32, 32);
    markerIcon.shadow = "http://www.google.com/intl/en_us/mapfiles/ms/icons/msmarker.shadow.png"
    markerIcon.shadowSize = new GSize(59, 32);

    return new TimeMapDatasetTheme({
        icon: markerIcon, 
        color: "#8E67FD",
        eventIcon: "timemap/images/purple-circle.png"
    });
}
 


/*----------------------------------------------------------------------------
 * TimeMapItem Class - holds references to map placemark and timeline event
 *---------------------------------------------------------------------------*/

/**
 * Create a new TimeMap item with a map placemark and a timeline event
 *
 * @constructor
 * @param {placemark} placemark     The map placemark (one of GMarker, GPolyline, or GPolygon)
 * @param {Event} event             The timeline event
 * @param {GMap2} map               Reference to the map object
 * @param {Object} options          A container for optional arguments:
 *   {String} title                     Title of the item
 *   {String} description               Plain-text description of the item
 *   {String} type                      Type of map placemark used (marker. polyline, polygon)
 *   {GLatLng} infoPoint                Point indicating the center of this item
 *   {String} infoHtml                  Full HTML for the info window
 *   {String} infoUrl                   URL from which to retrieve full HTML for the info window
 *   {String} maxInfoHtml               Full HTML for the maximized info window
 *   {String} maxInfoUrl                URL from which to retrieve full HTML for the maximized info window
 *   {String} maxOnly                   Whether to auto-maximize on open
 */
function TimeMapItem(placemark, event, map, options) {
    // initialize vars
    this.placemark = placemark;
    this.event = event;
    this.map = map;
    // get vars from options
    this._type = ("type" in options) ? options.type : "";
    this._title = ("title" in options) ? options.title : "";
    this._description = ("description" in options) ? options.description : "";
    this._infoPoint =  ("infoPoint" in options) ? options.infoPoint : null;
    this._infoHtml = ("infoHtml" in options) ? options.infoHtml : "";
    this._infoUrl = ("infoUrl" in options) ? options.infoUrl : "";
    this._maxInfoHtml = ("maxInfoHtml" in options) ? options.maxInfoHtml : "";
    this._maxInfoUrl = ("maxInfoUrl" in options) ? options.maxInfoUrl : "";
    this._maxOnly = ("maxInfoUrl" in options) ? options.maxOnly : false;
    
    // get functions
    this.getType = function() { return this._type; };
    this.getTitle = function() { return this._title; };
    this.getInfoPoint = function() { return this._infoPoint; };
    
    // create content for info window if none is provided
    if (this._infoHtml == "" && this._infoUrl == "" && !this._maxOnly) {
        this._infoHtml = '<div class="infotitle">' + this._title + '</div>';
        if (this._description != "") 
            this._infoHtml += '<div class="infodescription">' + this._description + '</div>';
    }
}

/*
 * Open the info window at an appropriate point
 *
 * @param {GMap2} map   Reference to the map object
 */
TimeMapItem.prototype.openInfoWindow = function() {
    // support for max content loaded via ajax
    var infoWindowOptions;
    var hasMax = false;
    if (this._maxInfoHtml != ""||this._maxInfoUrl != "") {
        hasMax = true;
        var maxContentDiv = document.createElement('div');
        if (this._maxInfoHtml != "")
            // load straight from data
            maxContentDiv.innerHTML = this._maxInfoHtml;
        else maxContentDiv.innerHTML = 'Loading...';
        infoWindowOptions = {maxContent: maxContentDiv};
        if (this._maxInfoHtml == "") {
            // load via ajax instead
            var iw = this.map.getInfoWindow();
            var ajaxUrl = this._maxInfoUrl;
            GEvent.addListener(iw, "maximizeclick", function() {
                GDownloadUrl(ajaxUrl, function(data) {
                    maxContentDiv.innerHTML = data;
                });
            });
        }
    } else infoWindowOptions = {};
    // standard version - text already loaded
    if (this._infoHtml != ""||(hasMax && this._maxOnly)) {
        if (this.getType() == "marker") {
            this.placemark.openInfoWindowHtml(this._infoHtml, infoWindowOptions);
        } else {
            this.map.openInfoWindowHtml(this.getInfoPoint(), this._infoHtml, infoWindowOptions);
        }
        if (hasMax && this._maxOnly) {
            this.map.getInfoWindow().maximize();
            var iw = this.map.getInfoWindow();
            var oMap = this.map;
            GEvent.addListener(iw, "restoreclick", function() {
                oMap.closeInfoWindow();
            });
        }
    }
    // load window html via ajax
    else if (this._infoUrl != "") {
        var item = this;
        GDownloadUrl(this._infoUrl, function(result) {
            item._infoHtml = result;
            item.openInfoWindow();
        });
    }
}

/*
 * Close the info window if it appears to be associated with this item
 *
 * @param {GMap2} map   Reference to the map object
 */
TimeMapItem.prototype.closeInfoWindow = function() {
    if (this.getType() == "marker") {
        this.placemark.closeInfoWindow();
    } else {
        var infoWindow = this.map.getInfoWindow();
        // close info window if its point is the same as this item's point
        if (infoWindow.getPoint() == this.getInfoPoint() 
            && !infoWindow.isHidden())
                this.map.closeInfoWindow();
    }
}

// convenience trim function
function trim(str) {
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
}