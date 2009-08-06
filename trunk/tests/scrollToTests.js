
var tm = null, items = null;

function exposeTestFunctionNames() {
    return [
        'testScrollTo'
    ];
}

function testScrollTo() {
    loadWithScrollTo('earliest', 1980);
    loadWithScrollTo('latest', 2000);
    loadWithScrollTo('1990-01-01', 1990);
    loadWithScrollTo(new Date(1980, 1, 1), 1980);
}


var items = [
    {
        "start" : "1980-01-02",
        "title" : "Test Event",
        "point" : {
            "lat" : 23.456,
            "lon" : 12.345
        }
    },
    {
        "start" : "2000-01-02",
        "title" : "Test Event",
        "point" : {
            "lat" : 23.456,
            "lon" : 12.345
        }
    }
];

function loadWithScrollTo(scrollTo, year) {
    // initialize load manager
    var loadManager = TimeMap.loadManager;
    loadManager.init(tm, 1, {
        scrollTo: scrollTo, 
        dataDisplayedFunction: function() {
            var d = tm.timeline.getBand(0).getCenterVisibleDate();
            assertEquals('Testing "' + scrollTo + '"', year, d.getUTCFullYear());
        }
    });
    // load items
    var callback = function() { loadManager.complete() };
    loader = new TimeMap.loaders.basic({items: items});
    loader.load(tm.datasets["test"], callback);
}

function setUpPage() {
    
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required)
        scrollTo: "earliest",
        datasets: [ 
            {
                title: "Test Dataset",
                id: "test",
                type: "basic",
                options: {
                    items: []
                }
            }
        ]
    });
    setUpPageStatus = "complete";
}
