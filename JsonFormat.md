If you're providing JSON data directly to timemap.js, or if you're transforming external JSON data into the format timemap.js expects, this is the basic model you should use:

```
myItem = {
    // title: appears on the timeline and in the map info window
    "title" : "My Item",
    // start date/time in ISO 8601 format
    "start" : "2008-02-01",
    // end date, for events with duration; leave this out for instant events
    "end" : "2008-03-01",
    // this could be either "point", "polyline", "polygon", or "overlay"
    "point" : {
        "lat" : 43.6433,
        "lon" : 11.9875
    },
    // various optional data
    // anything included here will be available in the item.opts object once loaded
    "options" : {
        // by default, the description is included in the info window
        "description": "An exciting description"
    }
}
myDataset.loadItem(myItem);
```

There are additional pieces of data you can include in the options object, and additional ways of specifying map geometries - the best way to learn about this is to look at the code in the examples and tests.