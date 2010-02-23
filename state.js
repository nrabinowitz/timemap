/*
 * Timemap.js Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**
 * @fileOverview
 * Functions in this file are used to set the timemap state programmatically,
 * either in a script or from the url hash.
 *
 * @requires param.js
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 */

/*----------------------------------------------------------------------------
 * TimeMap object methods
 *---------------------------------------------------------------------------*/

/**
 * Set the timemap state with a set of configuration options.
 *
 * @param {Object} state    Object with state config settings
 */
TimeMap.prototype.setState = function(state) {
    var params = TimeMap.state.params,
        key;
    // go through each key in state
    for (key in state) {
        if (state.hasOwnProperty(key)) {
            if (key in params) {
                // run setter function with config value
                params[key].set(this, state[key]);
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
        params = TimeMap.state.params,
        key;
    // run through params, adding values to state
    for (key in params) {
        if (params.hasOwnProperty(key)) {
            // get state value
            state[key] = params[key].get(this);
        }
    }
    return state;
};

/**
 * Initialize state tracking based on URL. 
 * Note: continuous tracking will only work
 * on browsers that support the "onhashchange" event.
 */
TimeMap.prototype.initState = function() {   
    var tm = this;
    tm.setStateFromUrl();
    window.onhashchange = function() {
        tm.setStateFromUrl();
    };
};

/**
 * Set the timemap state with parameters in the URL
 */
TimeMap.prototype.setStateFromUrl = function() {
    this.setState(TimeMap.state.fromUrl());
};

/**
 * Get current state parameters serialized as a hash string
 *
 * @return {String}     State parameters serialized as a hash string
 */
TimeMap.prototype.getStateParamString = function() {
    return TimeMap.state.toParamString(this.getState());
};

/**
 * Get URL with current state parameters in hash
 *
 * @return {String}     URL with state parameters
 */
TimeMap.prototype.getStateUrl = function() {
    return TimeMap.state.toUrl(this.getState());
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
     * Get the state parameters from the URL, returning as a config object
     * 
     * @return {Object}             Object with state config settings
     */
    fromUrl: function() {
        var pairs = location.hash.substring(1).split('&'),
            params = TimeMap.state.params,
            state = {}, x, pair, key;
        for (x=0; x < pairs.length; x++) {
            if (pairs[x] != "") {
                pair = pairs[x].split('=');
                key = pair[0];
                if (key && key in params) {
                    state[key] = params[key].fromString(decodeURI(pair[1]));
                }
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
        var params = TimeMap.state.params, 
            paramArray = [], 
            key;
        // go through each key in state
        for (key in state) {
            if (state.hasOwnProperty(key)) {
                if (key in params) {
                    paramArray.push(key + "=" + encodeURI(params[key].toString(state[key])));
                }
            }
        }
        return paramArray.join("&");
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
    },
    
    /**
     * Set state settings on a config object for TimeMap.init()
     * @see TimeMap.init
     *
     * @param {Object} config       Config object for TimeMap.init(), modified in place
     * @param {Object} state        Object with state config settings
     */
    setConfig: function(config, state) {
        var params = TimeMap.state.params,
            key;
        for (key in state) {
            if (state.hasOwnProperty(key)) {
                if (key in params) {
                    params[key].setConfig(config, state[key]);
                }
            }
        }
    },
    
    /**
     * Set state settings on a config object for TimeMap.init() using
     * parameters in the URL
     * @see TimeMap.init
     * @example
         // set up the config object
         var config = {
            // various settings, as usual for TimeMap.init()
         };
         
         // get state settings from the URL, e.g.:
         // http://www.example.com/mytimemap.html#zoom=4&selected=1
         TimeMap.state.setConfigFromUrl(config);
         
         // initialize TimeMap object
         var tm = TimeMap.init(config);
     *
     * @param {Object} config       Config object for TimeMap.init()
     */
    setConfigFromUrl: function(config) {
        TimeMap.state.setConfig(config, TimeMap.state.fromUrl());
    }

};

/**
 * @namespace
 * Namespace for state parameters, each with a set of functions to set and serialize values.
 * Add your own Param objects to this namespace to get and set additional state variables.
 */
TimeMap.state.params = {
        
        /**
         * Map zoom level
         * @type TimeMap.Param
         */
        zoom: new TimeMap.OptionParam({
            get: function(tm) {
                return tm.map.getZoom();
            },
            set: function(tm, value) {
                tm.map.setZoom(value);
            },
            fromStr: function(s) {
                return parseInt(s);
            }
        }, "mapZoom"),
        
        /**
         * Map center
         * @type TimeMap.Param
         */
        center: new TimeMap.OptionParam({
            get: function(tm) {
                return tm.map.getCenter();
            },
            set: function(tm, value) {
                tm.map.setCenter(value);
            },
            fromStr: function(s) {
                var params = s.split(",");
                if (params.length < 2) {
                    // give up
                    return null;
                }
                return new GLatLng(
                    parseFloat(params[0]),
                    parseFloat(params[1])
                );
            },
            toStr: function(value) {
                return value.lat() + "," + value.lng();
            }
        }, "mapCenter"),
        
        /**
         * Timeline center date
         * @type TimeMap.Param
         */
        date: new TimeMap.Param({
            get: function(tm) {
                return tm.timeline.getBand(0).getCenterVisibleDate();
            },
            set: function(tm, value) {
                tm.scrollToDate(value);
            },
            setConfig: function(config, value) {
                config.scrollTo = value;
            },
            fromStr: function(s) {
                return TimeMapDataset.hybridParser(s);
            },
            toStr: function(value) {
                return TimeMap.util.formatDate(value);
            }
        }),
        
        /**
         * Index of selected/open item, if any
         * @type TimeMap.Param
         */
        selected: new TimeMap.Param({
            get: function(tm) {
                var items = tm.getItems(),
                    i = items.length-1;
                while (i >= 0 && i--) {
                    if (items[i].selected) break;
                }
                return i;
            },
            set: function(tm, value) {
                if (value >= 0) {
                    var item = tm.getItems()[value];
                    if (item) {
                        item.openInfoWindow();
                    }
                }
            },
            fromStr: function(s) {
                return parseInt(s);
            }
        })
};
