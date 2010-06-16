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
 * @param {String} [options.itemTag]        Name of tag containing one item
 * @parem {String[]} [options.extraTags]    Array of names for extra tag elements to load
 * @param {Object} [options.tagMap]         Map of tagName:paramName pairs, if you want to load
 *                                          data into a differently-named elements
 * @param {mixed} [options[...]]            Other options (see {@link TimeMap.loaders.remote})
 * @return {TimeMap.loaders.remote} Remote loader configured for XML
 */
TimeMap.loaders.xml = function(options) {
    var loader = new TimeMap.loaders.remote(options),
        itemTag = options.itemTag || "item",
        tagMap = options.tagMap || {},
        extraTags = options.extraTags || [],
        paramMap = options.paramMap || {},
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
    
    // Set up parameter mapping
    for (tagName in tagMap) {
        if (tagMap.hasOwnProperty(tagName)) {
            paramName = tagMap[tagName];
            if (params[paramName]) {
                params[paramName].sourceName = tagName;
            }
        }
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
    
    /**
     * @name TimeMap.loaders.xml#parse
     * Basic XML parser function
     *
     * @param {String} xml      XML to parse
     */
    loader.parse = function(xml) {
        var items = [],
            root = GXml.parse(xml),
            placemarks = TimeMap.util.getNodeList(root, itemTag),
            i, pm, paramName, data;
        for (i=0; i<placemarks.length; i++) {
            data = {};
            pm = placemarks[x];
            // run through parameters, loading each
            for (paramName in params) {
                if (params.hasOwnProperty(paramName)) {
                    params[paramName].setConfigXML(pm, data);
                }
            }
            // look for any extra tags specified
            loader.parseExtra(data, pm);
            items.push(data);
        }
        // clean up
        node = placemarks = pm = null;
        return items;
    };
    
    return loader;
};
