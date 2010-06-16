/*
 * Timemap.js Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */
 
/**
 * @fileOverview
 * GeoRSS Loader
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */
 
/*globals TimeMap */

 /**
 * @class
 * Abstract XML loader factory - inherits from remote loader
 *
 * <p>This is a loader class for XML files, but without any implementation
 * of the parse() function, so it needs to be subclassed.</p>
 *
 * @augments TimeMap.loaders.remote
 * @requires param.js
 *
 * @param {Object} options          All options for the loader:<pre>
 *   {Array} url                        URL of KML file to load (NB: must be local address)
 *   {Function} preloadFunction         Function to call on data before loading
 *   {Function} transformFunction       Function to call on individual items before loading
 *   {String[]} extraTags               Array of names for extra tag elements to load
 * </pre>
 * @return {TimeMap.loaders.remote} Remote loader configured for XML
 */
TimeMap.loaders.xml = function(options) {
    var loader = new TimeMap.loaders.remote(options),
        extraTags = options.extraTags || [],
        extraParams = [],
        x;
    
    // set up extra tags;
    for (x=0; x < extraTags.length; x++) {
        extraParams.push(
            new TimeMap.params.XMLParam(extraTags[x])
        );
    }
    
    /**
     * @name TimeMap.loaders.xml#parseExtra
     * Parse any extra tags that have been specified into the config object
     *
     * @param {Object} config       Config object to modify
     * @param {XML NodeList} node   Parent node to look for tags in
     */
    loader.parseExtra = function(config, node) {
        for (var x=0; x<extraParams.length; x++) {
            extraParams[x].setConfigXML(config, node);
        }
    };
    
    return loader;
};