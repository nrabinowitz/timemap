/* 
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/*----------------------------------------------------------------------------
 * JSON Loader 
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * This is a simple, generalized way to load JSON data. It assumes that the 
 * JSON can be loaded from a url to which a callback function name can be
 * appended, e.g. "http://www.test.com/getsomejson.php?callback="
 * The loader then appends a nonce function name which the JSON should include.
 * This works for services like GData.
 *
 * Usage:
 *      JSONLoader.read(jsonUrl, function(result) {
 *          // do something with the JSON data, e.g.:
 *          dataset.loadItems(result);
 *      });
 *
 * Depends on lib/json2.pack.js for plain json loads
 *
 *---------------------------------------------------------------------------*/

var JSONLoader = {};
JSONLoader.counter = 0;

/**
 * Reads JSON from a URL, assuming that the service is set up to applied
 * a callback function specified in the URL parameters.
 *
 * @param {String}      jsonUrl     URL to load, missing the callback function name
 * @param {function}    f           Callback function to apply to returned data
 */
JSONLoader.read = function(jsonUrl, f) {
    // Define a unique function name
    var callbackName = "_" + JSONLoader.counter++;

    JSONLoader[callbackName] = function(result) {
        f(result);                           // Pass result to user function
    };

    // Create a script tag, set its src attribute and add it to the document
    // This triggers the HTTP request and submits the query
    var script = document.createElement("script");
    script.src = jsonUrl + "JSONLoader." + callbackName;
    document.body.appendChild(script);
};

/**
 * JSONP loader function - expects a url to which a callback function name can
 * be appended.
 *
 * @param {Object} data             Data object from TimeMap.init()
 * @param {TimeMapDataset} dataset  Dataset to load data into
 * @param {Function} preload        Function to manipulate data before load
 * @param {Function} transform      Function to transform individual items before load
 * @param {Function} loadMgr        Load manager object
 */
TimeMap.loaders.jsonp = function(data, dataset, preload, transform, loadMgr) {
    // get items
    JSONLoader.read(data.url, function(result) {
        var items = preload(result);
        dataset.loadItems(items, transform);
        loadMgr.increment();
    });
}

/**
 * JSON loader function - expects to retrieve a plain JSON string.
 *
 * @param {Object} data             Data object from TimeMap.init()
 * @param {TimeMapDataset} dataset  Dataset to load data into
 * @param {Function} preload        Function to manipulate data before load
 * @param {Function} transform      Function to transform individual items before load
 * @param {Function} loadMgr        Load manager object
 */
TimeMap.loaders.json_string = function(data, dataset, preload, transform, loadMgr) {
    // get json string
    GDownloadUrl(data.url, function(result) {
        var items = JSON.parse(result);
        items = preload(items);
        dataset.loadItems(items, transform);
        // tell the load manager we're done
        loadMgr.increment();
    });
}

// Probably the default json loader should be json_string, not
// jsonp. I may change this in the future, so I'd encourage you to use
// the specific one you want.
TimeMap.loaders.json = TimeMap.loaders.jsonp;