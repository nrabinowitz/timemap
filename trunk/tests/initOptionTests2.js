function exposeTestFunctionNames() {
    return [
        'testManualCenterAndZoom',
        'testMapType'
    ];
}

function testManualCenterAndZoom() {
    assertFalse("centerOnItems incorrectly set as default", tm.opts.centerOnItems);
    var center = tm.map.getCenter();
    assertTrue("Map center latitude too far south", center.lat > 37.9);
    assertTrue("Map center latitude too far north", center.lat < 38.1);
    assertTrue("Map center longitude too far east", center.lon < -122.9);
    assertTrue("Map center longitude too far west", center.lon > -123.1);
    assertTrue("Map zoom wrong", tm.map.getZoom() == 8);
}

function testMapType() {
    // this will fail for openlayers right now
    assertEquals("mapType not set properly", mxn.Mapstraction.SATELLITE, tm.map.getMapType());
}

var tm;
// page setup script
function setUpPage() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        options: {
            centerOnItems: false,
            mapZoom: 8,
            mapCenter: new mxn.LatLonPoint(38, -123),
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
