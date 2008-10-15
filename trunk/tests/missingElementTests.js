function exposeTestFunctionNames() {
    return [
        'testItemsLoaded',
        'testItemsLoadedInEventSource'
    ];
}

function testItemsLoaded() {
    var ds = tm.datasets["test"];
    assertEquals("three items in item array", ds.getItems().length, 3);
}

function testItemsLoadedInEventSource() {
    var ds = tm.datasets["test"];
    assertEquals("two items in eventSource", ds.eventSource.getCount(), 2);
}