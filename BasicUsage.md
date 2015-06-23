**This page describes usage for version 1.x. Until I can update it, see the [basic examples](http://timemap.googlecode.com/svn/tags/2.0/examples/index.html) for version 2.x usage.**

This page outlines the basic usage of the timemap.js library. I've tried to make the API both as simple and as flexible as possible, though it's still geared towards developers who know Javascript fairly well. Make sure to check out the [examples](http://code.google.com/p/timemap/source/browse/#svn/trunk/examples) - you may well get further faster by starting with the example code than by starting from scratch.

**How to make a timemap**

  * [Download the timemap.js library](http://code.google.com/p/timemap/downloads/list) and unzip it somewhere on your server or local machine.

  * Make an HTML page with a `<div>` tag to hold the map and another to hold the timeline. Give them unique ids (e.g. "map" and "timeline") and size them with CSS. I've found that the CSS can be a little easier if you put the map and timeline `<div>` tags inside container `<div>` tags that can be sized separately.

  * In the `<head>` of your HTML page, include the Google maps script (you'll need to get an [API key](http://code.google.com/apis/maps/signup.html) from Google, of course), the SIMILE Timeline script, and the timemap.js script. In most cases, you'll probably want to use the file `timemap_full.pack.js` - this includes all the other scripts in the library, packed with the YUI compressor. If you're concerned about download size, you could use the `timemap.pack.js` file and include other scripts as necessary.

  * There are several versions of the SIMILE Timeline library. The older version of the library can be found at http://static.simile.mit.edu/timeline/api/timeline-api.js, while newer versions are available at http://api.simile-widgets.org/timeline. The older version has fewer functions, but has a smaller footprint. Use whichever version makes sense for you; I've also included an optimized version of the library in the timemap.js distribution, in the `lib` folder.

> The page should look something like this (though of course you can put other things in here besides just the map and timeline if you want):

```
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <title>Map Timeline Mashup</title>
    <script src="http://maps.google.com/maps?file=api&v=2&key=[API-KEY]" type="text/javascript"></script>
    <script src="http://static.simile.mit.edu/timeline/api/timeline-api.js" type="text/javascript"></script>
    <script src="timemap_full.pack.js" type="text/javascript"></script>
    <link href="your-css-file.css" type="text/css" rel="stylesheet"/>
  </head>
  <body onLoad="onLoad()" onunload="GUnload();">
    <div id="timelinecontainer">
      <div id="timeline"></div>
    </div>
    <div id="mapcontainer">
      <div id="map"></div>
    </div>
  </body>
</html>
```

  * You may have noticed the `onLoad()` function called in the page as shown above. You'll need to write that function, either in the `<head>` of your HTML page or in a separate Javascript file. Fortunately, the only thing that function needs to do is call `TimeMap.init()` with the settings and data for your timemap. At bare minimum, you need to pass the ids of the map and timeline `<div>`s, and whatever data you'd like to load. A very simple `onLoad()` function, with one dataset containing one item, might look like this:

```
function onLoad() {
  tm = TimeMap.init({
    mapId: "map",               // Id of map div element (required)
    timelineId: "timeline",     // Id of timeline div element (required) 
    datasets: [
      {
        data: {
          type: "basic",  // Other options include "json" and "kml"
          value: [        // Put in an array of objects
            {
              // The start date for the event
              "start" : "2008-09-02",
              // The end date for the event - omit for instant events    
              "end" : "2008-09-30",
              // The placemark could be a point, polyline, polygon, or overlay
              "point" : {                   
                "lat" : 37.872312,
                "lon" : -122.258863
              },
              // by default, the title and description are shown in the info window
              "title" : "An event at South Hall",
              "options" : {
                "description" : "UC Berkeley School of Information"
              }
            }
          ]
        }
      }
    ]
  });
}
```

And that's it! There are a ton of different possible options for the `TimeMap.init()` function - you can find a reference in the [examples/timemapinit\_usage.js file](http://code.google.com/p/timemap/source/browse/trunk/examples/timemapinit_usage.js) and the various example files. If you find you can't do what you want with `TimeMap.init()`, you can [write your own initialization script](CustomInitScript.md) - but you can probably do a lot of what you want without going that far. If you run into problems, check out some thoughts on [TroubleShooting](TroubleShooting.md) or ask on the [Google Group](http://groups.google.com/group/timemap-development).