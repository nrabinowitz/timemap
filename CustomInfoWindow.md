# Introduction #

The Timemap.js library is set up to allow developers total control over the info window that opens for a selected item. The default is to use the map's info window, and there's a lot of support for that in the library, but you could also do pretty much anything else when a map or timeline item is clicked.

The following examples assume that you're loading data as Javascript literals (the `basic` loader) or as JSON, as these are the most flexible options, but you can do all of this with KML or GeoRSS as well (see [the KML ExtendedData example](http://timemap.googlecode.com/svn/tags/2.0/examples/kml_extendeddata.html) for how to load arbitrary data in KML).

## Method 1: Stick the HTML into each item ##

The default info window HTML looks like this:

```
<div class="infotitle">{{title}}</div>
<div class="infodescription">{{description}}</div>
```

If you put HTML into `item.options.description`, it'll go inside the "infodescription" div in the default template. If you put HTML into `item.options.infoHtml`, it will replace this entire block of code. So the JSON for an individual item might look like:

```
{
  "title":"My Item",
  "options": {
      // goes in the description div
      "description": 'This is <a href="http://example.com">a link</a>.'
   },
   // etc
}
```

or

```
{
  "title":"My Item",
  "options": {
      // replaces all HTML in the info window
      "infoHTML": '<div><strong>My Item</strong> has many <em>fine qualities</em>.</div>'
   },
   // etc
}
```

## Method 2: Make a new infoTemplate ##

You can also define a new HTML template at the `TimeMap` or `TimeMapDataset` level, and then put the variables in the options for your items. This makes sense if you want (or need) to keep the HTML out of the items you're loading, and you have a consistent format for all your items; it also reduces the amount of HTML you need to load, which would reduce the download time for your data.

To make a new template, define it in as `options.infoTemplate` in the config:

```
TimeMap.init({
  options: {
    infoTemplate: '<div><strong>{{title}}</strong> has many <em>{{things}}</em>.</div>',
    // etc
  },
  // etc
});
```

or, at the dataset level:

```
TimeMap.init({
  datasets: [
    {
      options: {
        infoTemplate: '<div><strong>{{title}}</strong> has many <em>{{things}}</em>.</div>',
        // etc
      },
      // etc
    }
  ]
  // etc
});
```

The `{{placeholders}}` refer to keys in the item `options` object, so your items might look like:

```
{
  "title":"My Item",
  "options": {
      "things": "awesome sauces"
   },
   // etc
}
```

The `title` is a special case here - when an item is loaded, the title gets put in the `TimeMapItem#opts` object, so you can refer to it as well.

## Method 3: Using a custom openInfoWindow function ##

The first two options should give you all the flexibility you need if you want custom content in the map info window. But what if you want to significantly change what happens when items are clicked - e.g. open a pop-up window or a pane somewhere else on the page?

In that case, you can define a custom `openInfoWindow` function, at either the `TimeMap`, `TimeMapDataset`, or `TimeMapItem` level. If you're doing something off of the map, you'll probably need to also define a custom `closeInfoWindow` function, which the library will call when the item is hidden or removed.

You define the function in the config `options` object. The keyword `this` refers to the `TimeMapItem`, and you can get to the placemark, `TimeMap`, map, etc. through references on the item (see the [TimeMapItem docs](http://timemap.googlecode.com/svn/tags/2.0/docs/symbols/TimeMapItem.html)).

For example:

```
TimeMap.init({
  options: {
    openInfoWindow: function() {
      // call some custom function, passing the item
      openPopup(this);
    },
    closeInfoWindow: function() {
      // call some custom function
      closePopup();
    },
  },
  // etc
});
```

This technique can be used to use the [ExtInfoWindow](http://gmaps-utility-library-dev.googlecode.com/svn/trunk/extinfowindow/docs/examples.html) extension, as discussed in [this thread](http://groups.google.com/group/timemap-development/browse_thread/thread/de3fd94af4f4bf61/), or to do basically whatever you like. One pattern I've seen come up a couple of times is to do some custom stuff, then pass the window opening off to the default map window function:

```
function myCustomOpener() {
  // do some custom stuff with your item
  doStuff(this);
  // now open the info window as usual
  TimeMapItem.openInfoWindowBasic.call(this);
}
```