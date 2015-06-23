  * Timemap.js has a lot of independent moving pieces - the timeline, the map, the html and css you're using to lay them out on your page. If you run into trouble, the first thing is to figure out where the problem is - try simplifying things as much as possible until you get something working, and go from there. If you're trying to do something complicated with the map or the timeline, try doing it with just a timeline or just a map first.

  * On the same note, loading remote data files (JSON, KML, etc) should be pretty simple, but if you can't get it to work, try loading static inline data first - this will ensure that it's the remote data that's causing problems, not the rest of the code. Also note that most files, including KML, GeoRSS, and JSON strings, must live on the same site as the page with your timemap in order to load - if you want to load external KML, you may need to set up some kind of proxy on your server.

  * One problem I've found that can be hard to diagnose is actually the size of the divs, as set by CSS - if they are sized so that they have 0 height, for example, the javascript may throw an error. Try giving them absolute pixel sizes and a visible background first, and see if you can get that working. In some cases, the library may read CSS sizes before it's loaded any remote CSS files, so if this seems to be a problem, size the map and timeline divs using inline styles or style declarations in the same file.

  * If you're having trouble getting events to show up on the timeline, the first thing to check is whether events are being loaded at all. Useful things to check include `tm.datasets['yourdatasetid'].getItems()` (array of all loaded TimeMapItems) and `tm.timeline.getBand(0).getEventSource().getCount()` (count of events loaded on timeline). If there are items, but they aren't showing up, try adding the following line after your data is loaded:
```
tm.timeline.layout();
```
> If no events are loaded, even though they're showing up on the map, you might be formatting your dates wrong - standard ISO8601 formatting is the best bet (e.g. "2005-05-15").

  * Be aware that trailing commas and missing semicolons in JSON declarations can throw an error in IE. So this:
```
var test = {
  title: "Test title",
  description: "A description!", // <--- problem comma
} // <--- missing semicolon
```

> needs to be this:
```
var test = {
  title: "Test title",
  description: "A description!"
};
```