function exposeTestFunctionNames() {
    return [
        'testDatasetIsDefined',
        'testItemLoaded',
        'testItemLoadedInEventSource',
        'testEarliestDate',
        'testLatestDate',
        'testItemAttributes'
    ];
}

function testDatasetIsDefined() {
    assertNotUndefined("dataset is defined", tm.datasets["test"]);
}

function testItemLoaded() {
    var ds = tm.datasets["test"];
    assertEquals("one item in item array", ds.getItems().length, 1);
}

function testItemLoadedInEventSource() {
    var ds = tm.datasets["test"];
    assertEquals("one item in eventSource", ds.eventSource.getCount(), 1);
}

function testEarliestDate() {
    var ds = tm.datasets["test"];
    assertEquals("year matches", ds.eventSource.getEarliestDate().getUTCFullYear(), 1980);
    assertEquals("month matches", ds.eventSource.getEarliestDate().getUTCMonth(), 0);
    assertEquals("day matches", ds.eventSource.getEarliestDate().getUTCDate(), 2);
}

function testLatestDate() {
    var ds = tm.datasets["test"];
    assertEquals("year matches", ds.eventSource.getLatestDate().getFullYear(), 2000);
    assertEquals("month matches", ds.eventSource.getEarliestDate().getMonth(), 0);
    assertEquals("day matches", ds.eventSource.getEarliestDate().getUTCDate(), 2);
}

function testItemAttributes() {
    var items = tm.datasets["test"].getItems();
    var item = items[0];
    assertNotNull("event not null", item.event);
    assertNotNull("placemark not null", item.placemark);
    assertEquals("title matches", item.getTitle(), "Test Event");
    assertEquals("event title matches", item.event.getText(), "Test Event");
    assertEquals("placemark type matches", item.getType(), "marker");
    var point = new GLatLng(23.456, 12.345);
    assertTrue("point matches", item.getInfoPoint().equals(point));
}



var tm = null;

// page setup function - basic
function basicLoadTestSetup() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        datasets: [
            {
                title: "Test Dataset",
                id: "test",
                data: {
                    type: "basic",
                    value: [
                        {
                          "start" : "1980-01-02",
                          "end" : "2000-01-02",
                          "point" : {
                              "lat" : 23.456,
                              "lon" : 12.345
                           },
                          "title" : "Test Event",
                          "options" : {
                            "description": "Test Description"
                          }
                        }
                    ]
                }
            }
        ],
        dataDisplayedFunction: function() { setUpPageStatus = "complete"; }
    });
}

// page setup function - kml
function kmlLoadTestSetup() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        datasets: [
            {
                title: "Test Dataset",
                id: "test",
                data: {
                    type: "kml",
                    url: "data/data.kml" 
                }
            }
        ],
        dataDisplayedFunction: function() { setUpPageStatus = "complete"; }
    });
}

// page setup function - jsonp
function jsonLoadTestSetup() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        datasets: [
            {
                title: "Test Dataset",
                id: "test",
                data: {
                    type: "jsonp",
                    url: "data/data.js?cb=" 
                }
            }
        ],
        dataDisplayedFunction: function() { setUpPageStatus = "complete"; }
    });
}

// page setup function - json string
function jsonStringLoadTestSetup() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        datasets: [
            {
                title: "Test Dataset",
                id: "test",
                data: {
                    type: "json_string",
                    url: "data/data_string.js" 
                }
            }
        ],
        dataDisplayedFunction: function() { setUpPageStatus = "complete"; }
    });
}