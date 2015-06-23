As described in [this discussion thread](http://groups.google.com/group/timemap-development/browse_thread/thread/66d68669fefb86c7), there are a number of architectural changes in timemap.js version 2.0. The version 2.0 branch is still in development, but this page is meant as a running list of the changes developers may encounter if they want to upgrade code using the 1.x library to 2.0.

## Dependencies ##

Version 1.x had two dependencies: the Google Maps v2 API script and the SIMILE Timeline script. Version 2.0 has different dependencies, all of which must be loaded before the timemap.js library:

  * [jQuery](http://jquery.com) (my tests use v1.4.4, but earlier versions may work)
  * A map provider of your choice (I will be testing with Google v2, Google v3, Yahoo! Maps, OpenLayers, and Microsoft/Bing)
  * [Mapstraction](http://www.mapstraction.com) (at the moment, you need to use [the version here](https://github.com/nrabinowitz/mxn), which has been customized for timemap.js support; eventually these changes may be moved into the main Mapstraction library)
  * SIMILE Timeline (it's recommended that you use one of the packed versions in the timemap.js lib/ directory)

## Build ##

Version 2.0 moves to an [Apache Ant](http://ant.apache.org/)-based build system (v.1.x used a python file). While most developers will not need to deal with this, if you are working with the development branch code, you may want to use the `build.xml` file to help compress the code, build the compressed Mapstraction library, and generate documentation. To do this, you will need to install Apache Ant and create a new `build.properties` file in the same directory as `build.xml`. The `build.properties` file should include the paths to the various source and tools needed for the build (currently Mapstraction source, jsdoc-toolkit.jar, and yuicompressor.jar). Example file contents can be found in the `build.properties.sample` file.

## API Changes ##

The majority of the library should work with your existing code - the new version is largely backwards-compatible. A few changes that are not:

  * `TimeMap#map` and `TimeMapItem#placemark` now refer to the corresponding Mapstraction objects, not to the native map provider objects. Native map and placemark objects can be accessed through `TimeMap#getNativeMap` and `TimeMapItem#getNativePlacemark`.

  * `TimeMap.loaders.json_string` is now `TimeMap.loaders.json`.

  * `TimeMap.loaders.jsonp` now uses jQuery handling of JSONP requests. This means that urls are expected to have a "callback" parameter, and the name of the callback function should be replaced with "?" (in timemap.js v1.x, the name was simply left off the end of the URL). See the [jQuery.ajax documentation](http://api.jquery.com/jQuery.ajax/) for more details.

  * The date parser functions are now defined in `TimeMap.dateParsers`, rather than as static functions in the `TimeMapDataset` class.

  * The `icon` setting in a TimeMapTheme or in the options object for an item now refers only to the image, not to a fully configured icon object. Icon settings are given individually as `icon`, `iconSize`, `iconShadow`, `iconShadowSize`, and `iconAnchor`.

  * _(more to come)_