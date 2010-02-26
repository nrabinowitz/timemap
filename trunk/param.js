/*
 * Timemap.js Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * This file defines the Param class, which is used to get, set, and serialize
 * different fields on TimeMap and TimeMapItem objects.
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */

// save a few bytes
(function() {

/**
 * @name TimeMap.params
 * @namespace Namespace for parameter classes
 */
var params = TimeMap.params = {
    /**
     * @class
     * A parameter, with methods to get, set, and serialize the current value.
     *
     * @constructor
     * @param {Object} options          Container for named arguments
     * @param {Function} options.get            Function to get the current param value
     * @param {Function} options.set            Function to set the param to a new value
     * @param {Function} [options.setConfig]    Function to set a new value in a config object
     * @param {Function} [options.fromStr]      Function to parse the value from a string
     * @param {Function} [options.toStr]        Function to serialize the current value to a string
     */
    Param: function(options) {
        /**
         * Get the current state value from a TimeMap or TimeMapItem object
         * @function
         *
         * @param {TimeMap|TimeMapItem} o       Object to inspect
         * @return {mixed}                      Current state value
         */
        this.get = options.get;
        
        /**
         * Set the current state value on a TimeMap or TimeMapItem object
         * @function
         *
         * @param {TimeMap|TimeMapItem} o       Object to modify
         * @param {mixed} value                 Value to set
         */
        this.set = options.set;
        
        /**
         * Set a new value on a config object for TimeMap.init()
         * @function
         * @see TimeMap.init
         *
         * @param {Object} config   Config object to modify
         * @param {mixed} value     Value to set
         */
        this.setConfig = options.setConfig || function(config, value) {
            // default: do nothing
        };
        
        /**
         * Parse a state value from a string
         * @function
         *
         * @param {String} s        String to parse
         * @return {mixed}          Current state value
         */
        this.fromString = options.fromStr || function(s) {
            // default: this is a string
            return s;
        };
        
        /**
         * Serialize a state value as a string
         * @function
         *
         * @param {mixed} value     Value to serialize
         * @return {String}         Serialized string
         */
        this.toString = options.toStr || function(value) {
            // default: use the built-in string method
            return value.toString();
        };
        
        /**
         * Get the current value as a string
         * 
         * @param {TimeMap|TimeMapItem} o       Object to inspect
         */
        this.getString = function(o) {
            this.toString(this.get(o));
        };
        
        /**
         * Set the current state value from a string
         * 
         * @param {TimeMap|TimeMapItem} o       Object to modify
         * @param {String} s                    String version of value to set
         */
        this.setString = function(o, s) {
            this.set(o, this.fromString(s));
        };
    },

    /**
     * @class
     * A convenience class for those parameters which deal with a value
     * in the options of a TimeMap or TimeMapItem object, setting some
     * additional default functions.
     *
     * @augments TimeMap.params.Param
     *
     * @constructor
     * @param {String} paramName        String name of the option parameter
     * @param {Object} [options]        Container for named arguments (see {@link TimeMap.params.Param})
     */
    OptionParam: function(paramName, options) {
        options = options || {};
        var defaults = {
            get: function(o) {
                return o.opts[paramName];
            },
            set: function(o, value) {
                o.opts[paramName] = value;
            },
            setConfig: function(config, value) {
                config.options = config.options || {};
                config.options[paramName] = value;
            }
        };
        options = TimeMap.util.merge(options, defaults);
        return new params.Param(options);
    },

    /**
     * @class
     * A convenience class for those parameters which deal with a value
     * set at the top level of the config object for a TimeMap or TimeMapItem.
     *
     * @augments TimeMap.params.Param
     *
     * @constructor
     * @param {String} paramName        String name of the top-level parameter
     * @param {Object} [options]        Container for named arguments (see {@link TimeMap.params.Param})
     */
    TopLevelParam: function(paramName, options) {
        options = options || {};
        options.setConfig = function(config, value) {
            config[paramName] = value;
        };
        return new params.Param(options);
    }
};


/*----------------------------------------------------------------------------
 * TimeMapItem params
 *---------------------------------------------------------------------------*/

/**
 * @namespace Namespace for parameters used for loading data into a TimeMapItem 
 * object. Because these are intended for loading, only setConfig is defined.
 * XXX: The other functions would be easy enough to define here - worthwhile?
 */
TimeMap.loaders.base.prototype.params = {
    /**
     * Item title
     * @type TimeMap.params.Param
     */
    title: new params.TopLevelParam("title"),
    
    /**
     * Item start date
     * @type TimeMap.params.Param
     */
    start: new params.TopLevelParam("start"),
    
    /**
     * Item end date
     * @type TimeMap.params.Param
     */
    end: new params.TopLevelParam("end"),
    
    /**
     * Item description
     * @type TimeMap.params.Param
     */
    description: new params.OptionParam("description"),
    
    /**
     * Item latitude
     * @type TimeMap.params.Param
     */
    lat: new params.Param({
        setConfig: function(config, value) {
            config.point = config.point || {};
            config.point.lat = value;
        }
    }),
    
    /**
     * Item longitude
     * @type TimeMap.params.Param
     */
    lon: new params.Param({
        setConfig: function(config, value) {
            config.point = config.point || {};
            config.point.lon = value;
        }
    })
};

})();
