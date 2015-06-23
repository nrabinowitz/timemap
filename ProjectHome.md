**Timemap.js** is a Javascript library to help use online maps, including Google, OpenLayers, and Bing, with a SIMILE timeline. The library allows you to load one or more datasets in JSON, KML, or GeoRSS onto both a map and a timeline simultaneously. By default, only items in the visible range of the timeline are displayed on the map.

  * [Working Examples](http://timemap.googlecode.com/svn/tags/2.0.1/examples/index.html)
  * [Basic Usage](BasicUsage.md)
  * [Online code documentation](http://timemap.googlecode.com/svn/tags/2.0.1/docs/index.html)
  * [Timemap.js Discussion Group](http://groups.google.com/group/timemap-development)

## Version 2.0.1 Now Up! ##

Version 2.0.1 is primarily a maintenance release, fixing a number of small bugs and cleaning up a few things that weren't quite right in v.2.0. _Anyone using v.2.0 should probably upgrade to v.2.0.1_, as it is more stable and includes very few changes other than bug fixes and new unit tests. See the [changelog](http://timemap.googlecode.com/svn/tags/2.0.1/CHANGELOG.txt) for more details.

**Upgrading to v.2.x:** Timemap.js v.2.x includes several important changes from 1.x: it removes the dependency on Google Maps v2, and adds dependencies on jQuery and the Mapstraction library to allow support for multiple map providers, including Google v3, OpenLayers, and Bing Maps. _If you are intending to use Google Maps v2,_ the 1.6 version of the library might still be a better option, as it has fewer dependencies and doesn't have the complexity of supporting multiple map providers.

<img src='http://nickrabinowitz.com/site/wp-content/uploads/2011/10/timemap.jpg' alt='Timemap.js screenshots'>

<h2>Examples (<a href='http://timemap.googlecode.com/svn/tags/2.0.1/examples/index.html'>See All</a>)</h2>

Simple Three-Item Dataset (using inline JSON data and Google Maps v3)<br>
<ul><li><a href='http://timemap.googlecode.com/svn/tags/2.0.1/examples/basic_googlev3.html'>http://timemap.googlecode.com/svn/tags/2.0.1/examples/basic_googlev3.html</a></li></ul>

Post-Election Violence in Kenya (using KML data)<br>
<ul><li><a href='http://timemap.googlecode.com/svn/tags/2.0.1/examples/kenya.html'>http://timemap.googlecode.com/svn/tags/2.0.1/examples/kenya.html</a></li></ul>

Artists and Authors of the Renaissance (using data from Freebase.com)<br>
<ul><li><a href='http://timemap.googlecode.com/svn/tags/2.0.1/examples/artists.html'>http://timemap.googlecode.com/svn/tags/2.0.1/examples/artists.html</a></li></ul>


The library is designed to be developer-friendly, offering as much access as possible to the underlying APIs. Dependencies:jQuery, Mapstraction 2.x, a map provider of your choice, SIMILE Timeline v1.2 - 2.3.1. Comments welcomed at nick (at) nickrabinowitz (dot) com.<br>
<br>
If you like the code documentation style, you can also <a href='http://code.google.com/p/jsdoc-tably-template'>get the jsdoc template</a> for use in your own projects.<br>
<br>
<hr />
Please note that the timemap.js project is not affiliated with the long-standing <a href='http://www.timemap.net'>TimeMap Open Source Consortium</a> project at the University of Sydney, which offers an excellent stand-alone Java-based application for viewing geotemporal data.