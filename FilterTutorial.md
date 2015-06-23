# Introduction #

Timemap.js uses the concept of filter chains for hiding and showing items, but they can be applied for a variety of other uses as well. Basically, if you want to do something (hide, change color, cause to do a dance) to all items, or a subset of items, based on some event, then you want to use a filter chain.

The filter chain architecture has three basic parts:

  1. **The chain itself.** Each chain has a name, an array of filters, an "on" function, and an "off" function. The "on" function is applied if an item passes the filters (see below), and the "off" function is applied if it doesn't. The basic example here is a hide/show filter chain: In this case, the "on" function shows an item, and the "off" function hides it. Every timemap (as of v.1.5) starts off with two filter chains: "map", which shows and hides items on the map, and "timeline", which shows and hides events on the timeline.<br><br>
<ol><li><b>Filters.</b> Each filter chain includes an array of one or more filters. Each filter is a function taking one parameter, a <code>TimeMapItem</code>, and returning either <code>true</code> or <code>false</code> based on the current state of the item. For example, the <code>TimeMap.hidePastFuture</code> filter looks at a single item and returns <code>true</code> or <code>false</code> depending on whether the item's event is currently visible in the timeline.<br><br>
</li><li><b>A listener or other calling mechanism.</b> Now that you have a filter chain, you need to determine when the filter runs. For example, timemap.js calls the "map" filter every time the user scrolls the timeline. You could run the filter when the user zoomed the map in or out, moved the center of the map, pressed a button, etc.</li></ol>

<h1>Example</h1>

<b>Show items based on a custom property</b>

<a href='http://timemap.googlecode.com/svn/trunk/examples/filter.html'>See the completed example here.</a>

Say you have a dataset with a bunch of items, and each item has a set of tags. Above your timemap, you put a dropdown menu with a list of tags, defaulting to "All tags". When the user selects a tag from the dropdown menu, you want to display only items with that tag on your timemap.<br>
<br>
<ol><li>First, you need to load your items so that they include the tag data. There are various different ways to do this, but for the sake of simplicity let's assume that you're loading data in JSON. Anything you include in the <code>options</code> property of the item object you load will be available in the <code>opts</code> property of the <code>TimeMapItem</code> that is created when your data is loaded. So if a single item, in your JSON data, looks like this, you'll be able to access your tag array as <code>item.opts.tags</code>:<br>
<pre><code>{<br>
    title: "My item",<br>
    start: "2009-01-01",<br>
    point: {<br>
        lat: 36,<br>
        lon: -123<br>
    },<br>
    options: {<br>
        tags: ['spam', 'spork', 'spackle']<br>
    }<br>
}<br>
</code></pre>
</li><li>You <i>don't</i> need a new filter chain - you can use the "map" and "timeline" chains built into timemap.js. If you wanted to do something other than hide and show the items - for example, change their color - you'd need to add a new filter chain using the <code>tm.addFilterChain()</code> function.<br><br>
</li><li>You need a way to know what the dropdown menu is set to. Again, there are many ways to do this, but let's make it simple: When the user changes the dropdown, you'll set a global variable - let's attach it to the window and call it <code>window.selectedTag</code>.<br><br>
</li><li>You need to add a new filter, to check the tags against the dropdown menu. It should look at an item and determine whether the <code>selectedTag</code> is in the array. You don't need to put this function in <code>TimeMap.filters</code>, but it keeps your namespaces nice and tidy:<br>
<pre><code>TimeMap.filters.hasSelectedTag = function(item) {<br>
    // if no tag was selected, every item should pass the filter<br>
    if (!window.selectedTag) {<br>
        return true;<br>
    }<br>
    if (item.opts.tags) {<br>
        // look for selected tag<br>
        if (item.opts.tags.indexOf(window.selectedTag) &gt;= 0) {<br>
            // tag found, item passes<br>
            return true;<br>
        } <br>
        else {<br>
            // indexOf() returned -1, so the tag wasn't found<br>
            return false;<br>
        }<br>
    }<br>
    else {<br>
        // item didn't have any tags<br>
        return false;<br>
    }<br>
};<br>
</code></pre>
</li><li>You'll need to add this filter to the existing filter chains for the map and timeline (most likely in your onLoad function, after you've called <code>TimeMap.init()</code>):<br>
<pre><code>// add our new function to the map and timeline filter chains<br>
tm.addFilter("map", TimeMap.filters.hasSelectedTag); // hide map markers on fail<br>
tm.addFilter("timeline", TimeMap.filters.hasSelectedTag); // hide timeline events on fail<br>
</code></pre>
</li><li>Now you just need to add a handler that can fire when the dropdown menu changes. The handler will need to explicitly make the filters run:<br>
<pre><code>// onChange handler for dropdown menu<br>
function setSelectedTag(select) {<br>
    var idx = select.selectedIndex;<br>
    window.selectedTag = select.options[idx].value;<br>
    // run filters<br>
    tm.filter('map');<br>
    tm.filter('timeline');<br>
    // you'll need this to make the timeline update if you're using v.1.5 or lower<br>
    tm.timeline.layout();<br>
}<br>
</code></pre>
</li><li>Add the handler to your dropdown menu and you're done!</li></ol>

Note that if you want the layout of your items to get reset when some of them are hidden, you'll need to use a later version of Timeline, e.g. <a href='http://static.simile.mit.edu/timeline/api-2.2.0/timeline-api.js'>http://static.simile.mit.edu/timeline/api-2.2.0/timeline-api.js</a> .