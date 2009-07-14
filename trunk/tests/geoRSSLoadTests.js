function exposeTestFunctionNames() {
    return [
        'testDatasetsAreDefined',
        'testRSSItemLoaded',
        'testRSSEarliestDate',
        'testRSSItemAttributes',
        'testAtomItemLoaded',
        'testAtomEarliestDate',
        'testAtomItemAttributes',
        'testMixedItemsLoaded',
        'testMixedPlacemarksFound'
    ];
}

function testDatasetsAreDefined() {
    assertNotUndefined("RSS dataset is defined", tm.datasets["rss"]);
    assertNotUndefined("Atom dataset is defined", tm.datasets["atom"]);
}

function testRSSItemLoaded() {
    var ds = tm.datasets["rss"];
    assertEquals("one item in item array", ds.getItems().length, 1);
}

function testRSSEarliestDate() {
    var ds = tm.datasets["rss"];
    assertEquals("year matches", ds.eventSource.getEarliestDate().getFullYear(), 1980);
    assertEquals("month matches", ds.eventSource.getEarliestDate().getMonth(), 0);
    // Timeline seems to adjust for the timezone after parsing :(
    assertEquals("day matches", ds.eventSource.getEarliestDate().getDate(), 1);
}

function testRSSItemAttributes() {
    var items = tm.datasets["rss"].getItems();
    var item = items[0];
    assertEquals("title matches", item.getTitle(), "Test Event");
    assertEquals("placemark type matches", item.getType(), "marker");
    var point = new GLatLng(23.456, 12.345);
    assertTrue("point matches", item.getInfoPoint().equals(point));
}

function testAtomItemLoaded() {
    var ds = tm.datasets["atom"];
    assertEquals("one item in item array", ds.getItems().length, 1);
}

function testAtomEarliestDate() {
    var ds = tm.datasets["atom"];
    assertEquals("year matches", ds.eventSource.getEarliestDate().getFullYear(), 1980);
    assertEquals("month matches", ds.eventSource.getEarliestDate().getMonth(), 0);
    // Timeline seems to adjust for the timezone after parsing :(
    assertEquals("day matches", ds.eventSource.getEarliestDate().getDate(), 1);
}

function testAtomItemAttributes() {
    var items = tm.datasets["atom"].getItems();
    var item = items[0];
    assertEquals("title matches", item.getTitle(), "Test Event");
    assertEquals("placemark type matches", item.getType(), "marker");
    var point = new GLatLng(23.456, 12.345);
    assertTrue("point matches", item.getInfoPoint().equals(point));
}

function testMixedItemsLoaded() {
    var ds = tm.datasets["mixed"];
    assertEquals("four items in item array", 4, ds.getItems().length);
}

function testMixedPlacemarksFound() {
    var items = tm.datasets["mixed"].getItems();
    var pmTypes = ['GeoRSS-Simple','GML (pos)','GML (coordinates)','W3C Geo'];
    for (x=0; x<items.length; x++) {
        var item = items[x];
        assertEquals(pmTypes[x] + ": placemark type matches", item.getType(), "marker");
        var point = new GLatLng(23.456, 12.345);
        assertTrue(pmTypes[x] + ": point matches", item.getInfoPoint().equals(point));
    }
}


var tm = null;

function setUpPage() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        datasets: [
            {
                title: "Test Dataset: RSS",
                id: "rss",
                type: "georss",
                options: {
                    url: "data/data.rss" 
                }
            },
            {
                title: "Test Dataset: Atom",
                id: "atom",
                type: "georss",
                options: {
                    url: "data/data-atom.xml" 
                }
            },
            {
                title: "Test Dataset: RSS, mixed formats",
                id: "mixed",
                type: "georss",
                options: {
                    url: "data/data-mixed.xml" 
                }
            }
        ],
        dataDisplayedFunction: function() { setUpPageStatus = "complete"; }
    });
}
