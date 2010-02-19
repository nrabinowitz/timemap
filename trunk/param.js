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
TimeMap.Param = function(options) {
    /**
     * @function
     * Get the current state value from a TimeMap object
     *
     * @param {TimeMap} tm      TimeMap object to inspect
     * @return {mixed}          Current state value
     */
    this.get = options.get;
    
    /**
     * @function
     * Set the current state value on a TimeMap object
     *
     * @param {TimeMap} tm      TimeMap object to modify
     * @param {mixed} value     Value to set
     */
    this.set = options.set;
    
    /**
     * @function
     * Set a new value on a config object for TimeMap.init()
     * @see TimeMap.init
     *
     * @param {TimeMap} config  Config object to modify
     * @param {mixed} value     Value to set
     */
    this.setConfig = options.setConfig || function(config, value) {
        // default: do nothing
    };
    
    /**
     * @function
     * Parse a state value from a string
     *
     * @param {String} s        String to parse
     * @return {mixed}          Current state value
     */
    this.fromString = options.fromStr || function(s) {
        // default: this is a string
        return s;
    };
    
    /**
     * @function
     * Serialize a state value as a string
     *
     * @param {TimeMap} value   Value to serialize
     * @return {String}         Serialized string
     */
    this.toString = options.toStr || function(value) {
        // default: use the built-in string method
        return value.toString();
    };
    
    /**
     * Set the current state value from a string
     * 
     * @param {TimeMap} tm      TimeMap object to modify
     * @param {String} s        String version of value to set
     */
    this.setString = function(tm, s) {
        this.set(this.fromString(s));
    };
};
