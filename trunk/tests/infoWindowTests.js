
// namespace for info window tests
var IWT = {};
    
IWT.setUpEventually = function() {
    var timeoutLimit = 3000,
        timeoutInterval = 100,
        elapsed = 0,
        timeoutId;
    function look() {
        IWT.success = IWT.setupTest();
        if (IWT.success || elapsed > timeoutLimit) {
            setUpPageStatus = "complete";
        }
        else {
            timeoutId = window.setTimeout(look);
        }
    }
    look();
}

function setUpPage() {
    IWT.tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        datasets: [ 
            IWT.dataset
        ]
    });
    IWT.setup();
    IWT.setUpEventually();
}


// move to separate files

IWT.dataset = {
    id: "test",
    type: "basic",
    options: {
        items: [
            {
                "start" : "1980-01-02",
                "point" : {
                    "lat" : 23.456,
                    "lon" : 12.345
                },
                "title" : "Test Event 1",
                "options" : {
                    "description": "Test Description"
                }
            }
        ]
    }
};

IWT.setup = function() {
    // this is the test preamble
    var ds = IWT.tm.datasets['test'];
    var item = ds.getItems()[0];
    item.openInfoWindow();
}

IWT.setupTest = function() {
    // this is effectively the assertion
    return $('div.infotitle, div.infodescription').length == 2
}

function exposeTestFunctionNames() {
    return [
        'testDefaultOpenClose'
    ];
}

function testDefaultOpenClose() {
    assertTrue('Timeout with no info window divs found', IWT.success);
    // test close while we're at it
    var ds = IWT.tm.datasets['test'];
    var item = ds.getItems()[0];
    item.closeInfoWindow();
    assertEquals('Info window div were found after the window was closed',
        0, $('div.infotitle, div.infodescription').length);
}