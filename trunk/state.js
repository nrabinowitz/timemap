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
 
 
Here's the basic idea - you've got an array of state setters, consisting of a key and a function:

TimeMap.state.setters = [ 
    'mapZoom': function(tm, value) {
        // set the map zoom according to value
        // tm == TimeMap object
    },
    // etc
]

users can manipulate this or add their own functions.

then a TimeMap.setState() function:

TimeMap.prototype.setState = function(state) {
    // state is a config object
    // go through each key in state, if there's a corresponding state.setters key,
    // run that function with the config value:
    TimeMap.state.setters[key](this, state[key]);
}

then a function to get the state config from the URL (probably the hash, right?)

TimeMap.state.getFromUrl = function() {
    // parse location.hash and extract key/value pairs;
    // return a config object
}

so to set state from the URL you have another function:

TimeMap.setStateFromUrl = function() {
    this.setState(TimeMap.state.getFromUrl());
}

then you need a corresponding set of state serializers, that can turn the 
current state into a config object

TimeMap.state.serializers = [
    function(tm, config) {
        // get state from tm, add to config as value
    }
]
 
 */