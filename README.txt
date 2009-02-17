/*! 
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

TimeMap
 
By Nick Rabinowitz (www.nickrabinowitz.com)
The TimeMap library is intended to sync a SIMILE Timeline with a Google Map.
Dependencies: Google Maps API v2, SIMILE Timeline v1.2
Thanks to Jörn Clausen (http://www.oe-files.de) for initial concept and code.
-------------------------------------------------------------------------------

Files in the project, in order of importance:

Packed files (YUI Compressor)
- timemap_full.pack.js:  The library and all helper files
- timemap.pack.js:       Just the core library file

Source files
- timemap.js:       The core TimeMap library - all you need to load and display local
                    JSON data on a timemap.
- manipulation.js:  Additional functions to manipulate a TimeMap after loading
- kmlparser.js      Parser functions for loading KML files
- georssparser.js   Parser functions for loading GeoRSS files
- jsonloader.js:    A helper script to load remote JSON data
- metawebloader.js  A helper script to load remote Metaweb data from freebase.com
- timemapexport.js  Additional functions to help export a TimeMap as serialized JSON

Documentation
- LICENSE.txt:      The license
- README.txt        This file

Other stuff
- edit/             Semi-experimental editing UI - depends on jQuery
- examples/         Example HTML code
- images/           Simple icons for timeline events
- lib/              External libraries that may be useful
- tests/            jsUnit tests

See the examples folder for (you guessed it) working examples. More
documentation can be found on the code site: 

Homepage:    http://code.google.com/p/timemap/
Basic Usage: http://code.google.com/p/timemap/wiki/BasicUsage

Discussion Group: http://groups.google.com/group/timemap-development

Comments welcomed at nick (at) nickrabinowitz (dot) com.

-------------------------------------------------------------------------------

CHANGELOG (somewhat rough - see the SVN commit log for more detail)

Version 1.4 (unreleased)
-----------
- Added GeoRSS parser
- Moved KML parser to separate file. NOTE: You now need to load kmlparser.js
separately to load KML, unless you are using timemap_full.pack.js.
- Improvements to default date parser
- Added several new examples: Google spreadsheet, lines between points, polytween
- New tests and small bugfixes

Version 1.3
-----------
- Relicensing with the MIT license
- some code refactoring - IMPORTANT: I removed timemapinit.js and made the init()
function a static method on TimeMap. The timemapInit() function still works (I
aliased it) but is deprecated. I also moved all post-initialization manipulation
functions to their own file, manipulation.js.
- adding json2 library and functions for exporting TimeMaps
- first release of experimental editing UI (jQuery-dependent)
- better filter chain handling
- tweaks and bugfixes

Version 1.2
-----------
- tweaks and bugfixes
- code cleanup
- a few new features, notably support for image overlays
- several new hooks for custom functions

Version 1.1
-----------
- tweaks and bugfixes
- added timemapInit() function

Version 1.0
-----------
- first release of the core library