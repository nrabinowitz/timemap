The `TimeMap.init()` function is in many ways the basic API of the timemap.js library - if all you need to do is display a timemap with some data, this function should be all you need, even for fairly complicated configurations.

## Basics ##

Assuming you want the timemap to be initialized when the page is first loaded, you'll want to call `TimeMap.init()` within an `onload` or (if you're using jQuery) `$(document).ready()` function. The `TimeMap.init()` function only takes one parameter, an object literal with all of the configuration options for the timemap.

Note that you can only call `TimeMap.init()` _once_ for a given timemap - as far as I know, calling it again on the same DOM elements will throw an error. There are other ways to dynamically load more data or change the timemap after it's initialized.

## The Configuration Object ##

The configuration object is multi-level, in that it generally contains several other configuration objects for the different parts of the timemap. The structure of the configuration object looks like this:

```

TimeMap.init({

    mapId: "< id >",        // DOM id for the map element, always required
    timelineId: "< id >",   // DOM id for the timeline element, ditto
    
    options: {
        // Options passed to the TimeMap object itself
    },
    
    datasets: [
        // Array of dataset configuration options, one for each dataset
        {
            // Configuration options for one dataset.
            
            // String (or class) specifying a type of loader in TimeMap.loaders
            type: "< type of loader >", 
            
            options: {
                // Configuration options to be passed to the loader
            }
        }
    ],
    
    // Timeline band configuration
    
    // Post-initialization options

});

```

### TimeMap Options ###

The top-level `options` object is used to initialize the `TimeMap` object itself. This object is not required, but you can use it to set configuration options for the map and global theme settings for the timemap. You can check out the `options` parameter in the [TimeMap constructor](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.html#constructor) for the full details; some of the most pertinent options below:

```
    options: {
        // map type (road, terrain, satellite image, etc) to use
        mapType: < Google Maps maptype >,
        // theme to apply to items on the timemap
        theme: < TimeMapTheme >,
        // unlike other theme settings, setting the eventIconPath here
        // will override this setting in dataset- and item-level themes
        eventIconPath: "< path to event icon images >",

        // ... other settings; see the code docs.
    },
```

### Dataset Options ###

Each dataset you want to load should have its own configuration object in the `datasets` array. Loading multiple datasets is a good idea if you are loading data from different sources or want to apply different themes to different datasets.

The only required element in a dataset configuration object is the `type` attribute. This is the string name of the desired loader, usually one of the classes in `TimeMap.loaders`. Each loader has its own set of required options.

For example, this is the minimal dataset definition for a `json_string` dataset, which loads JSON as a string from a static file:
```
{
    // name of class in TimeMap.loaders
    type: "json_string",
    options: {
        url: "mydata.json"
    }
}
```

See the code documentation for configuration examples for each type of loader in the library:
  * [Basic loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.basic.html)
  * [JSON string loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.json_string.html)
  * [JSONP loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.jsonp.html)
  * [KML loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.kml.html)
  * [GeoRSS loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.georss.html)
  * [Google Spreadsheet loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.gss.html)
  * [Flickr loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.flickr.html)
  * [Metaweb loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.metaweb.html)
  * [Progressive loader](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.loaders.progressive.html)

### Timeline Band Configuration ###

There are three ways to specify the timeline band properties in `TimeMap.init()`, going from the simplest, which isn't particularly flexible, to the more complicated, which is as flexible as Timeline allows:

**The `bandIntervals` parameter.**

In this case, you're just specifying the  time intervals (day, year, etc) of the top and bottom bands, and using the  default settings (80%/20%, 70px/100px, etc) for the rest. You can specify  the bandIntervals parameter as either an array, referencing the
Timeline.Datetime constants (as in the [Basic Example](http://timemap.googlecode.com/svn/trunk/examples/basic.html)):
```
TimeMap.init({ 
    bandIntervals: [ 
            Timeline.DateTime.DECADE, 
            Timeline.DateTime.CENTURY 
    ], 
    // etc... 
});
```

or using a string, which should be one of the members of [TimeMap.intervals](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMap.intervals.html) (e.g. "sec", "min", "hr", etc):
```
TimeMap.init({ 
    bandIntervals: "yr",  // year/decade 
    // etc... 
});
```

**The `bandInfo` parameter.**

This allows you to pass in an array of config objects that get passed to `Timeline.createBandInfo()`. See the [GeoRSS example](http://timemap.googlecode.com/svn/trunk/examples/earthquake_georss.html) for a timemap.js example and the [Timeline tutorial](http://code.google.com/p/simile-widgets/wiki/Timeline_GettingStarted) for more information on the options Timeline supports here. This should handle anything `Timeline.createBandInfo()` can; don't worry about the `eventSource`, as this will be filled in by `TimeMap.init()`.

This is the best option when you  want more control over the bands, but you want to keep everything fairly simple and deal mostly with config settings, not instantiating and  manipulating objects.
```
TimeMap.init({ 
       bandInfo: [ 
            { 
               width:          "85%", 
               intervalUnit:   Timeline.DateTime.DAY, 
               intervalPixels: 210 
            }, 
            { 
               width:          "15%", 
               intervalUnit:   Timeline.DateTime.WEEK, 
               intervalPixels: 150, 
               showEventText:  false, 
               trackHeight:    0.2, 
               trackGap:       0.2 
            } 
       ], 
       // etc... 
}); 
```

**The `bands` parameter.**

Use the `bands` parameter when you want to pass in fully instantiated band objects instead of config variables. You'll need to use this for example to use `Timeline.createHotZoneBandInfo()` (see
[Creating Hotzones](http://code.google.com/p/simile-widgets/wiki/Timeline_CreatingHotzones)) or to do some other fancy stuff with the bands.

```
var myBands = [
    Timeline.createHotZoneBandInfo({
        // your special configuration settings here
    }),
    // etc...
];
// maybe you could add some decorators here, etc...

TimeMap.init({ 
    bands: myBands, 
    // etc... 
});
```


_more coming soon_