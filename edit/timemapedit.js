/**---------------------------------------------------------------------------
 * TimeMap Editing Tools
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * Functions in this file offer tools for editing a timemap dataset in
 * a browser-based GUI. Call tm.enterEditMode() and tm.closeEditMode() 
 * to turn the tools on and off.
 * 
 * Depends on:
 * jQuery: jquery.com
 * jqModal: http://dev.iceburg.net/jquery/jqModal/
 * jeditable: http://www.appelsiini.net/projects/jeditable
 * Sorry for all the bloat, bu jQuery makes UI development much easier.
 *---------------------------------------------------------------------------*/
 
 /**
  * Add editing tools to the timemap.
  *
  * @param (String) editPaneId      ID of DOM element to be the edit pane.
  */
TimeMap.prototype.enterEditMode = function(editPaneId) {
    if (!this.editPane) {
        // default id
        if (!editPaneId) editPaneId = 'editpane';
        // look for existing div
        editPane = $('#' + editPaneId).get(0);
        if (!editPane) {
            // make it from string
            editPane = $('<div id="' + editPaneId + '" class="jqmWindow"></div>').get(0);
            var o = this;
            $(editPane).append(
                $('<div class="edittitle jqDrag" />').append(
                    $('<div id="editclose" />').click(function() {
                        o.closeEditMode();
                    })
                ).append($('<h3>Edit Datasets</h3>'))
            ).append($('<div id="editresize" class="jqResize" />'));
            $('body').append(editPane);
        }
        // make a holder for datasets
        var dsPane = $('<div id="dspane" />').get(0);
        $(editPane).append(dsPane);
        // save for later
        this.editPane = editPane;
        this.dsPane = dsPane;
        // make the edit pane a modal window
        $(this.editPane)
            .jqDrag('.jqDrag')
            .jqResize('.jqResize')
            .jqm({ overlay: 0 });
    }
    $(this.editPane).jqmShow();
    this.updateEditDatasets();
    // turn on placemark editing
    for (id in this.datasets) {
        var items = this.datasets[id].getItems();
        for (var x=0; x < items.length; x++) {
            items[x].enablePlacemarkEdits();
        }
    }
}

/**
 * Remove editing tools from the timemap.
 */
TimeMap.prototype.closeEditMode = function() {
    // close edit pane
    $(this.editPane).jqmHide();
    // turn off placemark editing
    for (id in this.datasets) {
        var items = this.datasets[id].getItems();
        for (var x=0; x < items.length; x++) {
            items[x].disablePlacemarkEdits();
        }
    }
}

/**
 * Update the entire dataset listing
 */
TimeMap.prototype.updateEditDatasets = function() {
    // clear
    $(this.dsPane).empty();
    // add all datasets
    for (id in this.datasets) {
        this.addEditDataset(this.datasets[id], this.dsPane);
    }
}

/**
 * Add a timemap dataset to the edit pane.
 * 
 * @param (Object) ds       Dataset to add
 * @param (DOM Element) el  Element to add the item to
 */
TimeMap.prototype.addEditDataset = function(ds, el) {
    // make the dataset div
    var dsdiv = $('<div class="dataset" />').get(0);
    // save reference
    ds.editdiv = dsdiv;
    ds.updateEditPane();
    $(el).append(dsdiv);
}

/**
 * Update the edit pane version of a timemap dataset.
 */
TimeMapDataset.prototype.updateEditPane = function() {
    if (!this.editdiv) return;
    else $(this.editdiv).empty();
    var ds = this;
    // add title
    $(this.editdiv).append(
        $('<div class="dstitle">' + this.getTitle() + '</div>')
            .editable(function(value, settings) { 
                ds.opts.title = value;
                return(value);
            })
    );
    // items
    var items = this.getItems();
    for (var x=0; x < items.length; x++) {
        this.addEditItem(items[x], this.editdiv);
    }
}

/**
 * Add a timemap item to the edit pane.
 * 
 * @param (Object) item     Item to add
 * @param (DOM Element) el  Element to add the item to
 */
TimeMapDataset.prototype.addEditItem = function(item, el) {
    // make the item div
    var itemdiv = $('<div class="item" />').get(0);
    // save reference
    item.editdiv = itemdiv;
    // update div
    item.updateEditPane();
    $(el).append(itemdiv);
}

/**
 * Update the edit pane version of a timemap item.
 */
TimeMapItem.prototype.updateEditPane = function() {
    if (!this.editdiv) return;
    else $(this.editdiv).empty();
    var item = this;
    // add placemark - XXX: support polys!
    $(this.editdiv).append(
        $('<div class="itemicon"><img src="' + this.placemark.getIcon().image + '"></div>')
            .click(function() {
                item.dataset.timemap.map.setCenter(item.getInfoPoint());
            })
    );
    // add title
    $(this.editdiv).append(
        $('<div class="itemtitle">' + this.getTitle() + '</div>')
            .editable(function(value, settings) { 
                item.opts.title = value;
                item.event._text = value;
                item.dataset.timemap.refreshTimeline();
                return(value);
            })
    );
    // add start time
    var startDate = item.dataset.timemap.formatDate(this.event.getStart());
    $(this.editdiv).append(
        $('<div class="itemlabel">Start:</div>')
    );
    $(this.editdiv).append(
        $('<div class="itemdate">' + startDate + '</div>')
            .editable(function(value, settings) {
                var s = item.dataset.opts.dateParser(value);
                // check for invalid dates
                if (s == null) return item.dataset.timemap.formatDate(item.event.getStart());
                if (!item.event.isInstant()) {
                    var dur = item.event.getEnd() - item.event.getStart();
                }
                // set new start date
                item.event._start = item.event._latestStart = s;
                if (!item.event.isInstant()) {
                    // move end date too - some type casting issues
                    item.event._end = item.event._earliestEnd = new Date((s-0) + dur);
                    item.updateEditPane();
                }
                item.dataset.timemap.refreshTimeline();
                return(value);
            })
    );
    // add end time
    var endDate = this.event.isInstant() ? "" : item.dataset.timemap.formatDate(this.event.getEnd());
    $(this.editdiv).append(
        $('<div class="itemlabel">End:</div>')
    );
    $(this.editdiv).append(
        $('<div class="itemdate">' + endDate + '</div>')
            .editable(function(value, settings) {
                var e = item.dataset.opts.dateParser(value);
                // check for invalid dates
                if (e == null) {
                    return item.event.isInstant() ? "" : item.dataset.timemap.formatDate(item.event.getEnd());
                }
                // set new start date
                item.event._end = item.event._earliestEnd = e;
                if (e < item.event.getStart()) {
                    item.event._start = item.event._latestStart = e;
                    item.event._instant = true;
                    item.updateEditPane();
                } else {
                    item.event._instant = false;
                }
                item.dataset.timemap.refreshTimeline();
                return(value);
            }, { placeholder: '<span class="missingelement">(add end date)</span>' })
    );
    // add description
    $(this.editdiv).append(
        $('<div class="itemdesc">' + this.opts.description + '</div>')
            .editable(function(value, settings) {
                item.opts.infoHtml = false;
                item.opts.description = value;
                return(value);
            }, { 
                type: 'textarea',
                rows: 5,
                cancel: 'Cancel',
                submit: 'OK',
                placeholder: '<span class="missingelement">(add description)</span>'
            })
    );
}

/**
 * Enable editing of this item's map placemark
 */
TimeMapItem.prototype.enablePlacemarkEdits = function() {
    var item = this;
    switch(this.getType()) {
        case "marker":
            // have to reinitialize the marker :(
            var np = new GMarker(this.placemark.getLatLng(), { 
                icon: this.placemark.getIcon(),
                draggable: true
            });
            np.item = item;
            np.enableDragging();
            // add listener to record new location
            GEvent.addListener(np, "dragend", function() {
                item.opts.infoPoint = this.getLatLng();
            });
            // swap
            this.map.removeOverlay(this.placemark);
            this.map.addOverlay(np);
            this.placemark = np;
            break;
        case "polyline":
        case "polygon":
            this.placemark.enableEditing({onEvent: "mouseover"});
            this.placemark.disableEditing({onEvent: "mouseout"});
            break;
    }
}

/**
 * Disable editing of this item's map placemark
 */
TimeMapItem.prototype.disablePlacemarkEdits = function() {
    var item = this;
    switch(this.getType()) {
        case "marker":
            // have to reinitialize the marker :(
            var np = new GMarker(this.placemark.getLatLng(), { 
                icon: this.placemark.getIcon()
            });
            np.item = item;
            // add listener to make placemark open when event is clicked
            GEvent.addListener(np, "click", function() {
                item.openInfoWindow();
            });
            // swap
            this.map.removeOverlay(this.placemark);
            this.map.addOverlay(np);
            this.placemark = np;
            break;
        case "polyline":
        case "polygon":
            this.placemark.disableEditing();
            break;
    }
}

/**
 * Static utility function - format a date as a string
 *
 * @param d (Date)  Date to format
 * @return (String) Formatted string
 */
TimeMap.prototype.formatDate = function(d) {
    // adjust granularity based on band intervals
    var str = d.getFullYear() + '-' + (d.getMonth() + 1 ) + '-' + d.getDate();
    var interval = this.timeline.getBand(0).getEther()._interval;
    // show time if top interval less than a week
    if (interval < Timeline.DateTime.WEEK) {
        str = str + ' ' + ((d.getHours() < 10) ? "0" : "") + d.getHours() + ':' 
            + ((d.getMinutes() < 10) ? "0" : "") + d.getMinutes();
        // show seconds if the interval is less than a day
        if (interval < Timeline.DateTime.DAY) {
            str = str + ((d.getSeconds() < 10) ? "0" : "") + d.getSeconds();
        }
    }
    return str;
}