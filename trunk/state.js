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
     * @class
     * A state parameter, with methods to get, set, and serialize the current value.
     *
     * @constructor
     * @param {Function} get            Function to get the current state value
     * @param {Function} set            Function to set the state to a new value
     * @param {Function} [setConfig]    Function to set a new value in a config object
     * @param {Function} [fromStr]      Function to parse the value from a string
     * @param {Function} [toStr]        Function to serialize the current value to a string
     */
    Param: function(get, set, setConfig, fromStr, toStr) {
        /**
         * @function
         * Get the current state value from a TimeMap object
         *
         * @param {TimeMap} tm      TimeMap object to inspect
         * @return {mixed}          Current state value
         */
        this.get = get;
        
        /**
         * @function
         * Set the current state value on a TimeMap object
         *
         * @param {TimeMap} tm      TimeMap object to modify
         * @param {mixed} value     Value to set
         */
        this.set = set;
        
        /**
         * @function
         * Set a new value on a config object for TimeMap.init()
         * @see TimeMap.init
         *
         * @param {TimeMap} config  Config object to modify
         * @param {mixed} value     Value to set
         */
        this.setConfig = setConfig || function(config, value) {
            // default: do nothing
        };
        
        /**
         * @function
         * Parse a state value from a string
         *
         * @param {String} s        String to parse
         * @return {mixed}          Current state value
         */
        this.fromString = fromStr || function(s) {
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
        this.toString = toStr || function(value) {
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
    },
    
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
     * @param {Object} config       Config object for TimeMap.init()
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
         * @type TimeMap.state.Param
         * Map zoom level
         */
        zoom: new TimeMap.state.Param(
            // get
            function(tm) {
                return tm.map.getZoom();
            },
            // set
            function(tm, value) {
                tm.map.setZoom(value);
            },
            // setConfig
            function(config, value) {
                config.options = config.options || {};
                config.options.mapZoom = value;
            },
            // fromString
            function(s) {
                return parseInt(s);
            },
            // toString
            null
        ),
        
        /**
         * @type TimeMap.state.Param
         * Map center
         */
        center: new TimeMap.state.Param(
            // get
            function(tm) {
                return tm.map.getCenter();
            },
            // set
            function(tm, value) {
                tm.map.setCenter(value);
            },
            // setConfig
            function(config, value) {
                config.options = config.options || {};
                config.options.mapCenter = value;
            },
            // fromString
            function(s) {
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
            // toString
            function(value) {
                return value.lat() + "," + value.lng();
            }
        ),
        
        /**
         * @type TimeMap.state.Param
         * Timeline center date
         */
        date: new TimeMap.state.Param(
            // get
            function(tm) {
                return tm.timeline.getBand(0).getCenterVisibleDate();
            },
            // set
            function(tm, value) {
                tm.scrollToDate(value);
            },
            // setConfig
            function(config, value) {
                config.scrollTo = value;
            },
            // fromString
            function(s) {
                return TimeMapDataset.hybridParser(s);
            },
            // toString
            function(value) {
                return TimeMap.util.formatDate(value);
            }
        ),
        
        /**
         * @type TimeMap.state.Param
         * Selected/open item, if any
         */
        selected: new TimeMap.state.Param(
            // get
            function(tm) {
                var items = tm.getItems(),
                    i = items.length-1;
                while (i--) {
                    if (items[i].selected) break;
                }
                return i;
            },
            // set
            function(tm, value) {
                var item = tm.getItems()[value];
                if (item) {
                    item.openInfoWindow();
                }
            },
            // setConfig
            null,
            // fromString
            function(s) {
                return parseInt(s);
            },
            // toString
            null
        )
};
