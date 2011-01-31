// XXX: should consolidate this test page...
function exposeTestFunctionNames() {
    return [
        'testAutoCenterAndZoom'
    ];
}

function testAutoCenterAndZoom() {
    assertTrue("centerOnItems not set as default", tm.opts.centerOnItems);
    // okay, let's do this with broad strokes
    assertTrue("Map auto-zoom too high", tm.map.getZoom() <= 8);
    assertTrue("Map auto-zoom too low", tm.map.getZoom() >= 6);
    var center = tm.map.getCenter();
    assertTrue("Map auto-center latitude too far south", center.lat > 40.0);
    assertTrue("Map auto-center latitude too far north", center.lat < 42.0);
    assertTrue("Map auto-center longitude too far east", center.lon < 12.5);
    assertTrue("Map auto-center longitude too far west", center.lon > 11.5);
}

var tm;
// page setup script
function setUpPage() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        options: {
            mapType: 'satellite'
        },
        datasets: [
            {
                id: "test",
                type: "basic",
                options: {
                    items: [
                        {
                          "start" : "1452",
                          "point" : {
                              "lat" : 40.0,
                              "lon" : 12.0
                           },
                          "title" : "Item 1"
                        },
                        {
                          "start" : "1475",
                          "point" : {
                              "lat" : 42.0,
                              "lon" : 12.0
                           },
                          "title" : "Item 2"
                        }
                    ]
                }
            }
        ]
    });
    setUpPageStatus = "complete";
}
