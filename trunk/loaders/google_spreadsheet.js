/* 
 * Timemap.js Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * Google Spreadsheet Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */

// for JSLint
/*global TimeMap */
 
/**
 * @class
 * Google spreadsheet loader factory - inherits from jsonp loader.
 *
 * <p>This is a loader for data from Google Spreadsheets. Takes an optional map
 * to indicate which columns contain which data elements; the default column
 * names (case-insensitive) are: title, description, start, end, lat, lon</p>
 * 
 * <p>See <a href="http://code.google.com/apis/spreadsheets/docs/2.0/reference.html#gsx_reference">http://code.google.com/apis/spreadsheets/docs/2.0/reference.html#gsx_reference</a>
 * for details on how spreadsheet column ids are derived. Note that date fields 
 * must be in yyyy-mm-dd format - you may need to set the cell format as "plain text" 
 * in the spreadsheet (Google's automatic date formatting won't work).</p>
 *
 * <p>The loader takes either a full URL, minus the JSONP callback function, or 
 * just the spreadsheet key. Note that the spreadsheet must be published.</p>
 *
 * @augments TimeMap.loaders.jsonp
 * @requires loaders/json.js
 *
 * @example Usage in TimeMap.init():
 
    datasets: [
        {
            title: "Google Spreadsheet by key",
            type: "gss",
            options: {
                key: "pjUcDAp-oNIOjmx3LCxT4XA" // Spreadsheet key
            }
        },
        {
            title: "Google Spreadsheet by url",
            type: "gss",
            options: {
                url: "http://spreadsheets.google.com/feeds/list/pjUcDAp-oNIOjmx3LCxT4XA/1/public/values?alt=json-in-script&callback="
            }
        }
    ]
 *
 * @param {Object} options          All options for the loader:<pre>
 *   {String} key                       Key of spreadsheet to load, or
 *   {String} url                       Full JSONP url of spreadsheet to load
 *   {Function} preloadFunction         Function to call on data before loading
 *   {Function} transformFunction       Function to call on individual items before loading
 * </pre>
 * @return {TimeMap.loaders.remote} Remote loader configured for Google Spreadsheets
 */
TimeMap.loaders.gss = function(options) {
    var loader = new TimeMap.loaders.jsonp(options);
    
    // use key if no URL was supplied
    if (!loader.url) {
        loader.url = "http://spreadsheets.google.com/feeds/list/" + 
            options.key + "/1/public/values?alt=json-in-script&callback=";
    }
        
    /**
     * Column map - defaults to TimeMap.loaders.gss.map
     * @name TimeMap.loaders.gss#map
     * @type Object
     */
    loader.map = options.map || TimeMap.loaders.gss.map;
    
    /**
     * Preload function for spreadsheet data
     * @name TimeMap.loaders.gss#preload
     * @parameter {Object} data     Data to preload
     * @return {Array} data         Array of item data
     */
    loader.preload = function(data) {
        return data.feed.entry;
    };
    
    /**
     * Transform function for spreadsheet data
     * @name TimeMap.loaders.gss#transform
     * @parameter {Object} data     Data to transform
     * @return {Object} data        Transformed data for one item
     */
    loader.transform = function(data) {
        // map spreadsheet column ids to corresponding TimeMap elements
        var fieldMap = loader.map;
        var getField = function(f) {
            var el = data['gsx$' + fieldMap[f]];
            if (el) {
                return el.$t;
            }
            else {
                return false;
            }
        };
        var item = {
            title: getField("title"),
            start: getField("start"),
            end: getField("end"),
            point: {
                lat: getField("lat"),
                lon: getField("lon")
            },
            options: {
                description: getField("description")
            }
        };
        // hook for further transformation
        var transform = options.transformFunction;
        if (transform) {
            item = transform(item);
        }
        return item;
    };

    return loader;
};

/**
 * 1:1 map of expected spreadsheet column ids. Modify this map
 * before loading data if you want different names for your columns.
 */
TimeMap.loaders.gss.map = {
    title:'title',
    description:'description',
    start:'start',
    end:'end',
    lat:'lat',
    lon:'lon'
};
