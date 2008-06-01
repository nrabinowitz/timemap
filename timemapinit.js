/*----------------------------------------------------------------------------
 * TimeMap Intialization Script
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * This is an attempt to create a general initialization script that will
 * work in most cases. If you need a more complex initialization, write your
 * own script instead of using this one.
 *
 * The idea here is to throw all of the standard intialization settings into
 * a large object and then pass it to the timemapInit() function. The full
 * data format is outlined below, but if you leave elements off the script 
 * will use default settings instead.
 *
 * Call timemapInit() inside of an onLoad() function (or a jQuery 
 * $.(document).ready() function, or whatever you prefer).
 *
 * See the examples for usage.
 *
 *---------------------------------------------------------------------------*/
 
/**
 * Intializes a TimeMap.
 *
 * @param {Object} config   Full set of configuration options.
 *                          See examples/timemapinit_usage.js for format.
 */
function timemapInit(config) {
    
    // check required elements
    if (!('mapId' in config) || !config['mapId']) {
        alert("TimeMap init: No map id was specified!");
        return;
    }
    if (!('timelineId' in config) || !config['timelineId']) {
        alert("TimeMap init: No timeline id was specified!");
        return;
    }
    
    // set defaults
    config = config || {}; // make sure the config object isn't null
    config['options'] = config['options'] || {};
    config['datasets'] = config['datasets'] || [];
    config['bandInfo'] = config['bandInfo'] || false;
    config['scrollTo'] = config['scrollTo'] || "earliest";
    if (!config['bandInfo']) {
        var intervals = config['bandIntervals'] || 
            [Timeline.DateTime.WEEK, Timeline.DateTime.MONTH];
        config['bandInfo'] = [
    		{
               width:          "80%", 
               intervalUnit:   intervals[0], 
               intervalPixels: 70
            },
            {
               width:          "20%", 
               intervalUnit:   intervals[1], 
               intervalPixels: 100,
               showEventText:  false,
               trackHeight:    0.4,
               trackGap:       0.2
            }
        ];
    }
    
    // create the TimeMap object
    var tm = new TimeMap(
  		document.getElementById(config['timelineId']), 
		document.getElementById(config['mapId']),
		config['options']
    );
    
    // create the dataset objects
    var datasets = [];
    for (var x=0; x < config['datasets'].length; x++) {
        var ds = config['datasets'][x];
        var dsOptions = ds['options'] || {};
        dsOptions['title'] = ds['title'] || '';
        dsOptions['theme'] = ds['theme'] || undefined;
        if (ds['dateParser']) dsOptions['dateParser'] = ds['dateParser'];
        var dsId = ds['id'] || "ds" + x;
        datasets[x] = tm.createDataset(dsId, dsOptions);
        if (x > 0) {
            // set all to the same eventSource
            datasets[x].eventSource = datasets[0].eventSource;
        }
    }
    
    // set up timeline bands
    var bands = [];
    // ensure there's at least an empty eventSource
    var eventSource = (datasets[0] && datasets[0]['eventSource']) || new Timeline.DefaultEventSource();
    for (var x=0; x < config['bandInfo'].length; x++) {
        var bandInfo = config['bandInfo'][x];
        if (!(('eventSource' in bandInfo) && bandInfo['eventSource']==null))
            bandInfo['eventSource'] = eventSource;
        else bandInfo['eventSource'] = null;
        bands[x] = Timeline.createBandInfo(bandInfo);
        if (x > 0) {
            // set all to the same layout
            bands[x].eventPainter.setLayout(bands[0].eventPainter.getLayout()); 
        }
    }
    // initialize timeline
    tm.initTimeline(bands);
    
    // set up load manager
    var loadMgr = {};
    loadMgr.count = 0;
    loadMgr.loadTarget = config['datasets'].length;
    loadMgr.ifLoadedFunction = function() {
        // custom function including timeline scrolling and layout
        if (config['dataLoadedFunction'])
            config['dataLoadedFunction'](tm);
        else {
            if (config['scrollTo']=="earliest")
                tm.timeline.getBand(0).setCenterVisibleDate(eventSource.getEarliestDate());
            else if (config['scrollTo']!="now" && config['scrollTo']!=null)
                tm.timeline.getBand(0).setCenterVisibleDate(eventSource.getLatestDate());
            tm.timeline.layout();
            // custom function to be called when data is loaded
            if (config['dataDisplayedFunction'])
                config['dataDisplayedFunction'](tm);
        }
    };
    loadMgr.ifLoaded = function() {
        this.count++;
        if (this.count == this.loadTarget)
            this.ifLoadedFunction();
    };
    
    // load data!
    for (var x=0; x < config['datasets'].length; x++) {
        (function(x) { // magic trick to deal with closure issues
            var data = config['datasets'][x]['data'];
            var ds = datasets[x];
            // use dummy function as default
            var dummy = function(data) { return data; }
            var preload = config['datasets'][x]['preloadFunction'] || dummy;
            var transform = config['datasets'][x]['transformFunction'] || dummy;
            switch(data['type']) {
                case 'basic':
                    // data already loaded
                    var items = preload(data['value']);
                    ds.loadItems(items, transform);
                    loadMgr.ifLoaded();
                    break;
                case 'json':
                    // data to be loaded from remote json
                    JSONLoader.read(data['url'], function(result) {
                        var items = preload(result);
                        ds.loadItems(items, transform);
                        loadMgr.ifLoaded();
                    });
                    break;
                case 'kml':
                    // data to be loaded from kml file
                    GDownloadUrl(data['url'], function(result) {
                        var items = TimeMapDataset.parseKML(result);
                        items = preload(items);
                        ds.loadItems(items, transform);
                	    loadMgr.ifLoaded();
                    });
                    break;
                case 'metaweb':
                    // data to be loaded from freebase query
                    Metaweb.read(data['query'], function(result) {
                        var items = preload(result);
                        ds.loadItems(result, transform);
                	    loadMgr.ifLoaded();
                    });
                    break;
            }
        })(x);
    }
    // return timemap object for later manipulation
    return tm;
}