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
    if (!config['bandInfo']) {
        var intervals = config['bandIntervals'] || 
            [Timeline.DateTime.WEEK, Timeline.DateTime.MONTH];
        config['bandInfo'] = [
    		{
               width:          "80%", 
               intervalUnit:   intervals[0], 
               intervalPixels: 50
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
        datasets[x] = tm.createDataset("ds" + x, 
            { title: ds['title'], theme: ds['theme'] }
        );
        if (x < 0) {
            // set all to the same eventSource
            datasets[x].eventSource = datasets[0].eventSource;
        }
    }
    
    // set up timeline bands
    var bands = [];
    // ensure there's at least an empty eventSource
    var eventSource = datasets[0].eventSource || new Timeline.DefaultEventSource();
    for (var x=0; x < config['bandInfo'].length; x++) {
        var bandInfo = config['bandInfo'][x];
        bandInfo['eventSource'] = eventSource;
        bands[x] = Timeline.createBandInfo(bandInfo);
    }
    // initialize timeline
    tm.initTimeline(bands);
    
    // set up load manager
    var loadMgr = {};
    loadMgr.loaded = 0;
    loadMgr.loadTarget = config['datasets'].length;
    var loadMgr.ifLoaded = function() {
        this.loaded++;
        if (this.loaded == this.loadTarget) {
            tm.timeline.getBand(0).setCenterVisibleDate(eventSource.getEarliestDate());
            tm.timeline.layout();
        }
    }
    // load data!
    for (var x=0; x < config['datasets'].length; x++) {
        var data = config['datasets'][x]['data'];
        // use dummy functions as defaults
        var preprocess = data['preloadFunction'] || function(data) { return data; };
        var transform = data['transformFunction'] || function(data) { return data; };
        var ds = datasets[x];
        switch(data['type']) {
            case 'basic':
                // data already loaded
                var items = preprocess(data['value']);
                ds.loadItems(items, transform);
                loadMgr.ifLoaded();
                break;
            case 'json':
                // data to be loaded from remote json
                JSONLoader.read(data['url'], function(result) {
                    var items = preprocess(result);
                    ds.loadItems(items, transform);
                    loadMgr.ifLoaded();
                });
                break;
            case 'kml':
                // data to be loaded from kml file
                GDownloadUrl(data['url'], function(result) {
                    var items = TimeMapDataset.parseKML(result);
                    items = preprocess(items);
                    ds.loadItems(items, transform);
            	    loadMgr.ifLoaded();
                });
                break;
            case 'metweb':
                // data to be loaded from freebase query
                Metaweb.read(data['query'], function(result) {
                    var items = preprocess(result);
                    ds.loadItems(result, transform);
            	    loadMgr.ifLoaded();
                });
                break;
        }
    }
}
 