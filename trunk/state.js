/*
 * Timemap.js Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * Functions in this file are used to set the timemap state programmatically,
 * either in a script or from the url hash.
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 


then a function to get the state config from the URL (probably the hash, right?)



 */

/*----------------------------------------------------------------------------
 * Core TimeMap state methods
 *---------------------------------------------------------------------------*/

/**
 * Set the timemap state with a set of configuration options.
 *
 * @param {Object} state    Object with state config settings
 */
TimeMap.prototype.setState = function(state) {
    var setters = TimeMap.state.setters,
        key;
    // go through each key in state
    for (key in state) {
        if (state.hasOwnProperty(key)) {
            if (key in setters) {
                // run setter function with config value
                setters[key](this, state[key]);
            }
        }
    }
};

/**
 * Get a configuration object of state variables
 *
 * @return {Object}     Object with state config settings
 */
TimeMap.prototype.getState = function() {
    var state = {},
        serializers = TimeMap.state.serializers,
        key;
    // run through serializers, adding values to state
    for (key in serializers) {
        if (serializers.hasOwnProperty(key)) {
            // run serializer to get state value
            state[key] = serializers[key](this);
        }
    }
    return state;
};

/**
 * Set the timemap state with parameters in the URL
 */
TimeMap.prototype.setStateFromUrl = function() {
    this.setState(TimeMap.state.getFromUrl());
};

/**
 * Get URL with current state parameters in hash
 *
 * @return {String}     URL with state parameters
 */
TimeMap.prototype.getStateUrl = function() {
    // XXX
};

/*----------------------------------------------------------------------------
 * State namespace, with setters, serializers, and url functions
 *---------------------------------------------------------------------------*/

/**
 * @namespace
 * Namespace for static state functions
 */
TimeMap.state = {

    /**
     * @namespace
     * Map of setter functions, each taking a TimeMap object and a value.
     * Add your own functions to this object to set additional state variables.
     */
    setters: {
        /**
         * Set the map zoom level
         * 
         * @param {TimeMap} tm      TimeMap object
         * @param {String} value    Zoom level
         */
        zoom: function(tm, value) {
            tm.map.setZoom(parseInt(value));
        },
        
        /**
         * Set the map center
         * 
         * @param {TimeMap} tm      TimeMap object
         * @param {String} value    Map center ("lat,lon" or "lat,lon,zoom")
         */
        center: function(tm, value) {
            var params = value.split(","),
                point, zoom;
            if (params.length < 2) {
                // give up
                return;
            }
            point = new GLatLng(
                parseFloat(params[0]),
                parseFloat(params[1])
            );
            if (params[3]) {
                zoom = parseInt(params[3]);
            }
            tm.map.setCenter(point, zoom);
        },
        
        /**
         * Set the timeline center date
         * 
         * @param {TimeMap} tm      TimeMap object
         * @param {String} value    Date to set (one of the strings accepted by TimeMap#parseDate)
         */
        date: function(tm, value) {
            tm.scrollToDate(value);
        },
        
        /**
         * Select/open a particular item
         * 
         * @param {TimeMap} tm      TimeMap object
         * @param {String} value    Index of item to select
         */
        selected: function(tm, value) {
            var index = parseInt(value),
                item = tm.getItems()[index];
            if (item) {
                item.openInfoWindow();
            }
        }
    },

    /**
     * @namespace
     * Map of serializer functions, each returning the value of the current state
     * as a string.  Add your own functions to this object to serialize additional 
     * state variables.
     */
    serializers: {
        /**
         * Get the map zoom level
         * 
         * @param {TimeMap} tm      TimeMap object
         * @return {String}         Zoom level
         */
        zoom: function(tm) {
            return tm.map.getZoom();
        },
        
        /**
         * Get the map center
         * 
         * @param {TimeMap} tm      TimeMap object
         * @return {String}         Map center ("lat,lon" or "lat,lon,zoom")
         */
        center: function(tm) {
            var center = tm.map.getCenter();
            return center.lat() + "," + center.lng();
        },
        
        /**
         * Get the timeline center date
         * 
         * @param {TimeMap} tm      TimeMap object
         * @return {String}         Timeline center date, in ISO8601 format
         */
        date: function(tm) {
            return TimeMap.util.formatDate(tm.timeline.getBand(0).getCenterVisibleDate());
        },
        
        /**
         * Get the selected item, if any
         * 
         * @param {TimeMap} tm      TimeMap object
         * @return {String}         Index of item to select
         */
        selected: function(tm) {
            var x = 0;
            tm.eachItem(function(item) {
                if (item.selected) {
                    return x;
                }
                x++;
            });
        }
    },
    
    /**
     * Get the state parameters from the URL, returning as a config object
     * 
     * @return {Object}             Object with state config settings
     */
    fromUrl: function() {
        var paramPairs = location.hash.substring(1).split('&'),
            state = {}, x, param;
        for (x=0; x < paramPairs.length; x++) {
            if (paramPairs[x] != "") {
                param = paramPairs[x].split('=');
                state[param[0]] = decodeURIComponent(param[1]);
            }
        }
        return state;
    },
    
    /**
     * Make a parameter string from a state object
     *
     * @param {Object} state        Object with state config settings
     * @return {String}             Parameter string in URL param format
     */
    toParamString: function(state) {
        var params = [], key;
        // go through each key in state
        for (key in state) {
            if (state.hasOwnProperty(key)) {
                params.append(key + "=" + encodeURIComponent(state[key]);
            }
        }
        return params.join("&");
    },
    
    /**
     * Make a full URL from a state object
     *
     * @param {Object} state        Object with state config settings
     * @return {String}             Full URL with parameters
     */
    toUrl: function(state) {
        var paramString = TimeMap.state.toParamString(state),
            url = location.href.split("#")[0];
        return url + "#" + paramString;
    }
    
};
