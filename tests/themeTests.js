function exposeTestFunctionNames() {
    return [
        'testThemeCascade',
        'testEventIconPath'
    ];
}

function testThemeCascade() {
    var tmTheme = TimeMapDataset.blueTheme();
    var dsThemeA = TimeMapDataset.greenTheme();
    var dsThemeA2 = TimeMapDataset.orangeTheme();
    var dsThemeB2 = TimeMapDataset.yellowTheme();
    var dsThemeC = TimeMapDataset.purpleTheme();
    // go through the items one by one
    var item = tm.datasets["testA"].getItems()[0];
    assertEquals(item.getTitle() + " inherits Dataset A theme", dsThemeA.color, item.event._color);
    var item = tm.datasets["testA"].getItems()[1];
    assertEquals(item.getTitle() + " overrides Dataset A theme", dsThemeA2.color, item.event._color);
    var item = tm.datasets["testB"].getItems()[0];
    assertEquals(item.getTitle() + " inherits Timemap theme", tmTheme.color, item.event._color);
    var item = tm.datasets["testB"].getItems()[1];
    assertEquals(item.getTitle() + " (string) overrides Timemap theme", dsThemeB2.color, item.event._color);
    var item = tm.datasets["testC"].getItems()[0];
    assertEquals(item.getTitle() + " inherits Dataset C theme (string)", dsThemeC.color, item.event._color);
}

function testEventIconPath() {
    var tmPath = '../images/';
    var dsPathA = '../images/dsA/';
    var dsPathA2 = '../images/dsA2/';
    // go through the items one by one
    var item = tm.datasets["testA"].getItems()[0];
    assertEquals(item.getTitle() + " inherits Dataset A path", dsPathA, item.event._icon.substr(0, 14));
    var item = tm.datasets["testA"].getItems()[1];
    assertEquals(item.getTitle() + " overrides Dataset A path", dsPathA2, item.event._icon.substr(0, 15));
    var item = tm.datasets["testB"].getItems()[0];
    assertEquals(item.getTitle() + " inherits Timemap path", tmPath, item.event._icon.substr(0, 10));
    var item = tm.datasets["testB"].getItems()[1];
    assertEquals(item.getTitle() + " inherits Timemap path", tmPath, item.event._icon.substr(0, 10));
    var item = tm.datasets["testC"].getItems()[0];
    assertEquals(item.getTitle() + " inherits Timemap path", tmPath, item.event._icon.substr(0, 10));
}

var tm = null;

function setUpPage() {
    tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required)
        options: {
            eventIconPath: '../images/',
            theme: TimeMapDataset.blueTheme()
        },
        datasets: [
            {
                title: "Test Dataset A",
                id: "testA",
                theme: TimeMapDataset.greenTheme(),
                options: {
                    eventIconPath: '../images/dsA/'
                },
                data: {
                    type: "basic",
                    value: [
                        {
                          "start" : "1980-01-02",
                          "end" : "1990-01-02",
                          "point" : {
                              "lat" : 23.456,
                              "lon" : 12.345
                           },
                          "title" : "Test Event A1"
                        },
                        {
                          "start" : "1980-01-02",
                          "end" : "1990-01-02",
                          "point" : {
                              "lat" : 23.456,
                              "lon" : 12.345
                           },
                          "title" : "Test Event A2",
                          "options": {
                            "eventIconPath": '../images/dsA2/',
                            "theme": TimeMapDataset.orangeTheme()
                          }
                        }
                    ]
                }
            },
            {
                title: "Test Dataset B",
                id: "testB",
                data: {
                    type: "basic",
                    value: [
                        {
                          "start" : "1980-01-02",
                          "end" : "1990-01-02",
                          "point" : {
                              "lat" : 23.456,
                              "lon" : 12.345
                           },
                          "title" : "Test Event B1"
                        },
                        {
                          "start" : "1980-01-02",
                          "end" : "1990-01-02",
                          "point" : {
                              "lat" : 23.456,
                              "lon" : 12.345
                           },
                          "title" : "Test Event B2",
                          "options": {
                            "theme": "yellow"
                          }
                        }
                    ]
                }
            },
            {
                title: "Test Dataset C",
                id: "testC",
                theme: "purple",
                data: {
                    type: "basic",
                    value: [
                        {
                          "start" : "1980-01-02",
                          "end" : "1990-01-02",
                          "point" : {
                              "lat" : 23.456,
                              "lon" : 12.345
                           },
                          "title" : "Test Event C1"
                        }
                    ]
                }
            }
        ]
    });
    setUpPageStatus = "complete";
}

function setUp() {
    var eventSource = tm.timeline.getBand(0).getEventSource();
    tm.timeline.getBand(0).setCenterVisibleDate(eventSource.getEarliestDate());
    tm.showDatasets();
}