This page outlines how to write a custom initialization script for the timemap.js library. You may need this if you want to use a complex timeline setup or some other non-standard initialization - one good reason to do this is to have different datasets appear on different timeline bands. Otherwise, you'll probably want to use the provided `TimeMap.init()` function, whose various options are explained in the [timemapinit\_usage.js file](http://code.google.com/p/timemap/source/browse/trunk/examples/timemapinit_usage.js).

The `TimeMap.init()` parameters are really flexible, and under most circumstances you'll want to use that if possible. But here's a quick primer on how to do it from scratch:

  * Start by making an HTML page like the one described in BasicUsage. Make sure to include the Google Maps script, the SIMILE Timeline script, and (at least) `timemap.js` or `timemap.pack.js`.

  * Now use an `onLoad()` script like the one below to set up your map and timeline.

```
function onLoad() {

    // Make a new TimeMap object, passing the ids of the map and timeline DOM elements.
    // This will initialize the map.
    var tm = new TimeMap(
        document.getElementById("timeline"), 
        document.getElementById("map"),
        {} // Any additional TimeMap options go here
    );

    // Make a new dataset with the id "sample1" and green markers.
    // You can load multiple datasets with different visual themes.
    var sample1 = tm.createDataset("sample1", {
        title:  "Sample One",
        theme:  "green"
    });

    // Make a new dataset with the id "sample2" and purple markers.
    var sample2 = tm.createDataset("sample2", {
        title:  "Sample Two",
        theme:  "purple"
    });

    // Create band information for the timeline as you would for any SIMILE timeline,
    // but using the eventSource from the dataset object.
    // See http://simile.mit.edu/timeline/docs/ for more info.
    // In this case we're making two equally-sized bands with two different datasets.
    var bands = [
        Timeline.createBandInfo({
            eventSource:    sample1.eventSource,
            width:          "50%",
            intervalPixels: 100,
            intervalUnit:   Timeline.DateTime.DAY
        }),
        Timeline.createBandInfo({
            eventSource:    sample2.eventSource,
            width:          "50%",
            intervalPixels: 100,
            intervalUnit:   Timeline.DateTime.DAY
        })
    ];

    // Initialize the timeline with the band info
    tm.initTimeline(bands);

    /*
     * LOAD YOUR DATA HERE
     */

} // end onLoad()
```

Where it says `LOAD YOUR DATA HERE` in the script above, you have a number of options. The simplest is just:

```
sample1.loadItems(items);
// you usually need to call this to get items to display on the timeline
tm.timeline.layout();
// you might also want to scroll the timeline somewhere
tm.timeline.getBand(0).setCenterVisibleDate(new Date());
```

where `items` is an array of defining the data for your items (see the JsonFormat page for more info). The second simplest option is to use one of the predefined loaders to load remote data, e.g.:

```
// here, we're using the KML loader - see the code docs for other options
loader = new TimeMap.loaders.kml({
    url: 'mydata.kml'
});
// load some data into one of your datasets
loader.load(sample1, function() {
    // again, layout and scroll, this time in a callback function
    tm.timeline.layout();
    tm.timeline.getBand(0).setCenterVisibleDate(new Date());
});
```

Just slightly more complicated, but really useful if you're loading more than one dataset, is to use the load manager to handle the callback functions. This also gives you the ability to set a "scrollTo" option, instead of dealing with it yourself.

```
// initialize load manager
var loadManager = TimeMap.loadManager;
loadManager.init(tm, 2, // this is the number of datasets we're loading 
    { scrollTo: "earliest" } // scrolls to earliest date in the datasets
);
// set callback to increment
var callback = function() { loadManager.increment() };
// load first dataset
loader = new TimeMap.loaders.kml({url: 'dataset1.kml'});
loader.load(sample1, callback);
// load second dataset
loader = new TimeMap.loaders.kml({url: 'dataset2.kml'});
loader.load(sample2, callback);
// scroll and any other callbacks will fire when both datasets have loaded
```

I should note that, if you're actually interested in having different datasets in different bars on the timeline, be aware that the default behavior, especially for triggering hide/show effects on the map, only applies to the top bar of the timeline - you'll need to add it manually to other bars if you want that to work.