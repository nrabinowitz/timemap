/*
 * Timemap.js Copyright 2010 Nick Rabinowitz.
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
 * XML loader factory - inherits from remote loader
 *
 * <p>This is a basic loader class for XML files, including a basic parse method for
 * simple XML files in a format like:</p> <pre>
    <root>
        <item>
            <tag>data</tag>
            ...
        </item>
        ...
    </root>
 </pre>
 * 
 *
 * @augments TimeMap.loaders.remote
 * @requires param.js
 *
 * @param {Object} options          All options for the loader
 * @param {String} options.url              URL of XML file to load (NB: must be local address)
 * @parem {String[]} [options.extraTags]    Array of names for extra tag elements to load
 * @param {Object} [options.tagMap]         Map of tagName:paramName pairs, if you want to load
 *                                          data into a differently-named elements
 * @param {mixed} [options[...]]            Other options (see {@link TimeMap.loaders.remote})
 * @return {TimeMap.loaders.remote} Remote loader configured for XML
 */
TimeMap.loaders.xml = function(options) {
    var loader = new TimeMap.loaders.remote(options),
        tagMap = options.tagMap || {},
        extraTags = options.extraTags || [],
        params = loader.params, 
        paramName, tagName, x;
    
    /**
     * @name TimeMap.loaders.xml#extraParams
     * Additional parameters to load
     * @type TimeMap.params.OptionParam[]
     */
    loader.extraParams = [];
    
    // set up extra params
    for (x=0; x < extraTags.length; x++) {
        tagName = extraTags[x];
        loader.extraParams.push(
            new TimeMap.params.OptionParam(tagMap[tagName] || tagName, {
                sourceName: tagName
            })
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
        var extraParams = loader.extraParams, x;
        for (x=0; x<extraParams.length; x++) {
            extraParams[x].setConfigXML(config, node);
        }
        node = null;
    };
    
    return loader;
};
