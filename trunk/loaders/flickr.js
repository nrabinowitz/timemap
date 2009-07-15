/* 
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/*----------------------------------------------------------------------------
 * Flickr Laoder 
 *
 * This is a loader for data from Flickr. You probably want to use it with a
 * URL for the Flickr Geo Feed API: http://www.flickr.com/services/feeds/geo/ 
 *
 * The loader takes a full URL, minus the JSONP callback function.
 *
 * Depends on:
 * - loaders/jsonp.js
 *
 * Usage in TimeMap.init():
 
    datasets: [
        {
            title: "Flickr Dataset",
            type: "flickr",
            options: {
                // This is just the latest geotagged photo stream - try adding
                // an "id" or "tag" or "photoset" parameter to get what you want
                url: "http://www.flickr.com/services/feeds/geo/?format=json&jsoncallback="
            }
        }
    ]
 
 */

/**
 * Flickr loader factory - inherits from jsonp loader
 *
 * @param {Object} options          All options for the loader:
 *   {String} url                       Full JSONP url of Flickr feed to load
 *   {Function} preloadFunction         Function to call on data before loading
 *   {Function} transformFunction       Function to call on individual items before loading
 */
TimeMap.loaders.flickr = function(options) {
    var loader = new TimeMap.loaders.jsonp(options);
    
    // preload function for Flickr feeds
    loader.preload = function(data) {
        return data["items"];
    };
    
    // transform function for Flickr feeds
    loader.transform = function(data) {
        var item = {
            title: data["title"],
            start: data["date_taken"],
            point: {
                lat: data["latitude"],
                lon: data["longitude"]
            },
            options: {
                description: data["description"]
                    .replace(/&gt;/g, ">")
                    .replace(/&lt;/g, "<")
                    .replace(/&quot;/g, '"')
            }
        };
        if (options.transformFunction) 
            item = options.transformFunction(item);
        return item;
    };

    return loader;
}