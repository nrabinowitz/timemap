function testVisible() {
    var items = tm.datasets["test"].getItems();
    var placemark = items[0].placemark;
    assertNotUndefined(placemark);
    assertFalse(placemark.isHidden());
}

function testItemHide() {
    var items = tm.datasets["test"].getItems();
    var placemark = items[0].placemark;
    placemark.hide();
    assertTrue(placemark.isHidden());
}

function testDatasetHideShow() {
    var ds = tm.datasets["test"];
    var items = tm.datasets["test"].getItems();
    var placemark = items[0].placemark;
    assertTrue(ds.visible);
    ds.hide();
    assertFalse(ds.visible);
    assertTrue(placemark.isHidden());
    ds.show();
    assertTrue(ds.visible);
    assertFalse(placemark.isHidden());
}

function testTimeMapDatasetHideShow() {
    var ds = tm.datasets["test"];
    var items = tm.datasets["test"].getItems();
    var placemark = items[0].placemark;
    tm.hideDatasets();
    assertFalse(ds.visible);
    assertTrue(placemark.isHidden());
    tm.showDatasets();
    assertTrue(ds.visible);
    assertFalse(placemark.isHidden());
    tm.hideDataset("test");
    assertFalse(ds.visible);
    assertTrue(placemark.isHidden());
    tm.showDatasets();
    tm.hideDataset("notarealid");
    assertTrue(ds.visible);
    assertFalse(placemark.isHidden());
}

function testHidePast() {
    var parser = Timeline.DateTime.parseIso8601DateTime;
    var items = tm.datasets["test"].getItems();
    var placemark = items[0].placemark;
    assertFalse(placemark.isHidden());
    var date = parser("1970-01-01");
    tm.timeline.getBand(0).setCenterVisibleDate(date);
    assertTrue(placemark.isHidden());
    var date = parser("1980-01-01");
    tm.timeline.getBand(0).setCenterVisibleDate(date);
    assertFalse(placemark.isHidden());
}

function testHideFuture() {
    var parser = Timeline.DateTime.parseIso8601DateTime;
    var items = tm.datasets["test"].getItems();
    var placemark = items[0].placemark;
    assertFalse(placemark.isHidden());
    var date = parser("2000-01-01");
    tm.timeline.getBand(0).setCenterVisibleDate(date);
    assertTrue(placemark.isHidden());
    var date = parser("1980-01-01");
    tm.timeline.getBand(0).setCenterVisibleDate(date);
    assertFalse(placemark.isHidden());
}