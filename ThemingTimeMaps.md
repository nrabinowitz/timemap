The question of how to style timemaps comes up periodically, and unfortunately it's not an easy one to answer. Timeline isn't very CSS-friendly; some of the styles and colors can be changed via CSS, but many are created inline with Javascript. Here's the basic rundown for styling:

**Timeline band colors** can be changed with CSS. See [timeline-1.2.css](http://code.google.com/p/timemap/source/browse/trunk/lib/timeline-1.2.css) for Timeline v.1.2 or [timeline-2.3.0.css](http://code.google.com/p/timemap/source/browse/trunk/lib/timeline-2.3.0.css) for Timeline v.2.3.0 to see the styles you can override in your own stylesheet.

**Timeline band settings**, like the pixel width between time intervals or the height of the bands, must be set using Timeline themes. Usually this means setting some options in the `bandInfo` configuration parameter in `TimeMap.init()`. See the [theme page on the Timeline wiki](http://www.simile-widgets.org/wiki/Timeline_CreatingNewThemes) for some more detail on themes (though not much, honestly).

**Timeline event styles** can be set in CSS with the same styles as above. The exceptions are colors and width, both of which are dealt with in Javascript.

**Timeline event colors and map placemark styles and icons** are set using Timemap.js themes. The Timemap.js library provides a default set of themes for Timeline events and map placemarks, which you can refer to by string, e.g. `theme: "yellow"`, in `TimeMap.init()`. These can be set at the timemap level, the dataset level, or the item level, and they cascade and get overwritten as you would expect. If you want to customize the themes to use different colors, you can create a new [TimeMapTheme object](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMapTheme.html). If you want to override just one color or setting of an existing preset theme, use [TimeMapTheme.create()](http://timemap.googlecode.com/svn/tags/1.6/docs/symbols/TimeMapTheme.html#.create). E.g.:

```
// red theme with black duration events
var myTheme = TimeMapTheme.create("red", {eventColor:"#000"});
// use theme
TimeMap.init({
  options: {
    theme: myTheme
  },
  // etc...
});
```

If you want to make a new theme and then refer to it by a string name in your data, add it to `TimeMap.themes`:
```
TimeMap.themes.redblack = myTheme;
// now you can load data with theme: "redblack"
```

**Map info window styles** can be set via CSS. By default, the info window has two classes, `.infotitle` and `.infodescription`; you can change the HTML template for the info window using the infoTemplate setting ([see an example here](http://timemap.googlecode.com/svn/trunk/examples/kml_extendeddata.html)), which allows you to set any style you'd like. To fully style the info window itself, you might need to use the [ExtInfoWindow library](http://gmaps-utility-library-dev.googlecode.com/svn/trunk/extinfowindow/docs/reference.html) - see [this discussion thread](http://groups.google.com/group/timemap-development/browse_frm/thread/de3fd94af4f4bf61) for more details.

I think that covers it. I know it's a pain that there are so many different places to change the visual settings, but the goal is to give you direct access to the theming options of the different APIs (Timeline, Google maps) while offering a convenient way of coordinating events and placemarks via `TimeMap.themes`.