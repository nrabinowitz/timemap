
function exposeTestFunctionNames() {
    return [
        'testHybridParser',
        'testISO8601Parser',
        'testGregorianParser'
    ];
}

function testHybridParser() {
    subTestISO8601('hybrid');
    subTestGregorian('hybrid');
    subTestError('hybrid');
}

function testISO8601Parser() {
    subTestISO8601('iso8601');
    subTestError('iso8601');
}

function testGregorianParser() {
    subTestGregorian('gregorian');
    subTestError('gregorian');
}

// test subroutines and set up for date/time tests
function subTestISO8601(dsid) {
    var ds = tm.datasets[dsid];
    var items = ds.getItems();
    var title = ds.getTitle();
    var testFunc = function(i, time) {
        var prefix = title + ", item " + i + " -- ";
        assertNotNull(prefix + "event not null", items[i].event);
        var d = items[i].event.getStart();
        assertEquals(prefix + "year matches", 1980, d.getUTCFullYear());
        assertEquals(prefix + "month matches", 0, d.getUTCMonth());
        assertEquals(prefix + "day matches", 2, d.getUTCDate());
        if (time) {
            assertEquals(prefix + "hour matches", 10, d.getUTCHours());
            assertEquals(prefix + "minute matches", 20, d.getUTCMinutes());
            assertEquals(prefix + "second matches", 30, d.getUTCSeconds());
        }
    }
    // basic ISO8601 date: "1980-01-02"
    // basic ISO8601 date, no dividers: "19800102"
    for (i=0; i<2; i++)
        testFunc(i, false);
    // basic ISO8601 date + time: "1980-01-02 10:20:30"
    // basic ISO8601 date + time, T format: "1980-01-02T10:20:30"
    // basic ISO8601 date + time, T format, no dividers: "19800102T102030"
    for (i=2; i<5; i++)
        testFunc(i, true);
}

function subTestGregorian(dsid) {
    var ds = tm.datasets[dsid];
    var items = ds.getItems();
    var title = ds.getTitle();
    var testFunc = function(i, year) {
        var prefix = title + ", item " + i + " -- ";
        assertNotNull(prefix + "event not null", items[i].event);
        var d = items[i].event.getStart();
        assertEquals(prefix + "year matches", year, d.getUTCFullYear());
    }
    // basic gregorian date: "1980"
    testFunc(5, 1980);
    // basic gregorian date, early year: "200"
    testFunc(6, 200);
    // basic gregorian date, early year AD: "5 AD"
    testFunc(7, 5);
    // basic gregorian date, early year BC: "200 BC"
    // (year 0 is 1 BC)
    testFunc(8, -199);
    // basic gregorian date, negative: "-200"
    testFunc(9, -200);
}

function subTestError(dsid) {
    var ds = tm.datasets[dsid];
    var items = ds.getItems();
    var title = ds.getTitle();
    var testFunc = function(i) {
        var prefix = title + ", item " + i + " -- ";
        assertNull(prefix + "event is null", items[i].event);
    }
    for (i=10; i<13; i++)
        testFunc(i, false);
}

// set up items
var items = [
    {
    // 0: basic ISO8601 date
      "start" : "1980-01-02",
      "title" : "Test Event"
    },
    {
    // 1: basic ISO8601 date, no dividers
      "start" : "19800102",
      "title" : "Test Event"
    },
    {
    // 2: basic ISO8601 date + time
      "start" : "1980-01-02 10:20:30Z",
      "title" : "Test Event"
    },
    {
    // 3: basic ISO8601 date + time, T format
      "start" : "1980-01-02T10:20:30Z",
      "title" : "Test Event"
    },
    {
    // 4: basic ISO8601 date + time, T format, no dividers
      "start" : "19800102T102030Z",
      "title" : "Test Event"
    },
    {
    // 5: basic gregorian date
      "start" : "1980",
      "title" : "Test Event"
    },
    {
    // 6: basic gregorian date, early year
      "start" : "200",
      "title" : "Test Event"
    },
    {
    // 7: basic gregorian date, early year AD
      "start" : "5 AD",
      "title" : "Test Event"
    },
    {
    // 8: basic gregorian date, early year BC
      "start" : "200 BC",
      "title" : "Test Event"
    },
    {
    // 9: basic gregorian date, negative
      "start" : "-200",
      "title" : "Test Event"
    },
    {
    // 10: no start at all
      "title" : "Test Event"
    },
    {
    // 11: start is empty string
      "start" : "",
      "title" : "Test Event"
    },
    {
    // 12: start is invalid string
      "start" : "test",
      "title" : "Test Event"
    }
];

var tm = null;
function setUpPage() {
    
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required) 
        datasets: [ 
            {
                title: "Test Dataset: Hybrid",
                id: "hybrid",
                dateParser: "hybrid",
                data: {
                    type: "basic",
                    value: items
                }
            },
            {
                title: "Test Dataset: ISO8601",
                id: "iso8601",
                dateParser: "iso8601",
                data: {
                    type: "basic",
                    value: items
                }
            }, 
            {
                title: "Test Dataset: Gregorian",
                id: "gregorian",
                dateParser: "gregorian",
                data: {
                    type: "basic",
                    value: items
                }
            }
        ]
    });
    setUpPageStatus = "complete";
}