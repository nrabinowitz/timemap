
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
                    "description": "Test Description",
                    "extra": "spam",
                    "infoTemplate": '<span id="custom">{{title}} - {{description}} - {{extra}}</span>'
                }
            },
            {
                "start" : "1980-01-02",
                "point" : {
                    "lat" : 23.456,
                    "lon" : 12.345
                },
                "title" : "Test Event 2",
                "options" : {
                    "openInfoWindow": function() {
                        $('body').append('<div id="custom2">' + this.opts.title + '<div>');
                    },
                    "closeInfoWindow": function() {
                        $('#custom2').remove();
                    }
                }
            }
        ]
    }
};

// tests

function exposeTestFunctionNames() {
    return [
        'testInfoTemplate',
        'testCloseOnHide',
        'testCustomOpenFunction'
    ];
}

IWT.setup = function() {
    // this is the test preamble
    var ds = IWT.tm.datasets['test'];
    var item = ds.getItems()[0];
    item.openInfoWindow();
}
IWT.setupTest = function() {
    // this is effectively the assertion
    return $('span#custom').length == 1
}
function testInfoTemplate() {
    assertTrue('Timeout with no templated info window found', IWT.success);
    assertEquals('Info window content incorrect', 
        'Test Event 1 - Test Description - spam', $('span#custom').text());
}

function testCloseOnHide() {
    var ds = IWT.tm.datasets['test'];
    var item = ds.getItems()[0];
    item.hidePlacemark();
    assertEquals('Info window element was found after the placemark was hidden',
        0, $('span#custom').length);
}

function testCustomOpenFunction() {
    var ds = IWT.tm.datasets['test'];
    var item = ds.getItems()[1];
    item.openInfoWindow();
    assertEquals('Custom info window did not open properly',
        1, $('div#custom2').length);
    item.closeInfoWindow();
    assertEquals('Custom info window did not close properly',
        0, $('div#custom2').length);
}