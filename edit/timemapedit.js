/*! 
 * TimeMap Copyright 2008 Nick Rabinowitz.
 * Licensed under the MIT License (see LICENSE.txt)
 */

/**---------------------------------------------------------------------------
 * TimeMap Editing Tools
 *
 * @author Nick Rabinowitz (www.nickrabinowitz.com)
 * Functions in this file offer tools for editing a timemap dataset in
 * a browser-based GUI. Call tm.enterEditMode() and tm.closeEditMode() 
 * to turn the tools on and off; set configuration options in 
 * tm.opts.editOpts (set as {options{editOpts{...}} in timemapInit()).
 * 
 * 
 * Depends on:
 * json2: lib/json2.pack.js
 * timemapexport.js
 * jQuery: jquery.com
 * jqModal: http://dev.iceburg.net/jquery/jqModal/
 * jeditable: http://www.appelsiini.net/projects/jeditable
 * Sorry for all the bloat, but jQuery makes UI development much easier.
 *---------------------------------------------------------------------------*/
 
 /**
  * Add editing tools to the timemap.
  *
  * @param (String) editPaneId      ID of DOM element to be the edit pane.
  * @param (Object) options         Options for edit mode - may also be set in tm.opts.editMode
  *     (String) saveTarget             URL for ajax save submissions (XXX:unsupported)
  *     (String) saveMode               Either "explicit" (default - you push a button) or "implicit"
  *                                     (save with every change) (XXX:unsupported)
  */
TimeMap.prototype.enterEditMode = function(editPaneId, options) {
    // set default options if none have been specified
    if (!this.opts.editOpts) {
        var opts = options || {};
        opts.saveTarget = opts.saveTarget || "";
        opts.saveMode =   opts.saveMode || "explicit";
        this.opts.editOpts = opts;
    }
    // create edit pane
    if (!this.editPane) {
        // default id
        if (!editPaneId) editPaneId = 'editpane';
        // look for existing div
        editPane = $('#' + editPaneId).get(0);
        var tmo = this;
        if (!editPane) {
            // make it from string
            editPane = $('<div id="' + editPaneId + '" class="jqmWindow"></div>').get(0);
            $(editPane).append(
                $('<div class="edittitle jqDrag" />').append(
                    $('<div id="editclose" />').click(function() {
                        tmo.closeEditMode();
                    })
                ).append($('<h3>Edit Datasets</h3>'))
            ).append($('<div id="editresize" class="jqResize" />'));
            $('body').append(editPane);
        }
        // make a holder for datasets
        var dsPane = $('<div id="dspane" />').get(0);
        $(editPane).append(dsPane);
        /* XXX: make a save button
        var saveButton = $('<div id="editsave"/>').append(
            $('<input type="button" value="Save Changes" />').click(function() {
              tmo.saveChanges()
            })
        );
        $(editPane).append(saveButton);
        */
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
    this.each(function(ds) {
        ds.enterEditMode();
    });
}

/**
 * Remove editing tools from the timemap.
 */
TimeMap.prototype.closeEditMode = function() {
    // close edit pane
    $(this.editPane).jqmHide();
    // turn off placemark editing
    this.each(function(ds) {
        ds.closeEditMode();
    });
}

/**
 * Save all the datasets to the specified target
 *
 * @param (Function) f    Optional callback function
 */
TimeMap.prototype.saveAllChanges = function(f) {
    var target = this.opts.editOpts.saveTarget;
    f = f || function(d){};
    if (target) {
        // XXX: Save options as well
        var data = {'datasets':JSON.stringify( this.datasets)}
        // send the datasets to the server, serialized
        $.post(target, data, f);
    }
}

/**
 * Update the entire dataset listing
 */
TimeMap.prototype.updateEditDatasets = function() {
    // clear
    $(this.dsPane).empty();
    var tmo = this;
    // add all datasets
    this.each(function(ds) {
        ds.enterEditMode();
        $(tmo.dsPane).append(ds.editpane);
    });
}

/**
 * Turn on editing for a single dataset.
 */
TimeMapDataset.prototype.enterEditMode = function() {
    if (!this.editpane) {
        // make the dataset div
        var dsdiv = $('<div class="dataset" />').get(0);
        // save reference
        this.editpane = dsdiv;
    }
    this.updateEditPane();
    this.each(function(item) {
        item.enablePlacemarkEdits();
    });
}

/**
 * Turn off editing for a single dataset.
 */
TimeMapDataset.prototype.closeEditMode = function() {
    $(this.editpane).empty();
    this.each(function(item) {
        item.disablePlacemarkEdits();
    });
}

/**
 * Save the dataset to the specified target
 *
 * @param (Function) f    Optional callback function
 */
TimeMapDataset.prototype.saveAllChanges = function(f) {
    try {
        var target = this.timemap.opts.editOpts.saveTarget;
    } catch(e) {
      return;
    }
    f = f || function(d){};
    if (target) {
        var data = {'datasets':JSON.stringify({'ds':this})}
        // send the datasets to the server, serialized
        $.post(target, data, f);
    }
}

/**
 * Update the edit pane version of a timemap dataset.
 */
TimeMapDataset.prototype.updateEditPane = function() {
    if (!this.editpane) return;
    else $(this.editpane).empty();
    var ds = this;
    // set up theme icon and menu
    var themeicon = $('<div class="datasettheme icon"></div>');
    // init menu
    var thememenu = $('<div class="thememenu"></div>')
        .jqm({
            'toTop': true,
            'trigger': false
        });
    // init icon
    themeicon.css('background', this.opts.theme.color)
        .css('cursor', 'pointer')
        .click(function() {
        thememenu.jqmShow()
            .css('top', themeicon.offset().top - 4)
            .css('left', themeicon.offset().left - 4);
        });
    // set up theme menu
    var themes = ['red', 'blue', 'green', 'orange', 'yellow', 'purple'];
    for (var x=0; x<themes.length; x++) {
        var theme = TimeMapDataset.themes[themes[x]];
        // correct the icon path
        theme.eventIconPath = ds.opts.theme.eventIconPath;
        theme.eventIcon = theme.eventIconPath + theme.eventIconImage;
        (function(theme) {
        // make a color button for each theme
        thememenu.append(
            $('<div class="datasettheme"></div>')
                .css('background', theme.color)
                .css('cursor', 'pointer')
                .click(function() { 
                    // change the dataset theme
                    themeicon.css('background', theme.color);
                    ds.changeTheme(theme);
                    thememenu.jqmHide();
                })
        );
      })(theme);
    }
    // add theme menu and icon
    $(this.editpane)
        .append(thememenu)
        .append(themeicon);
    // add title
    $(this.editpane).append(
        $('<div class="dstitle">' + this.getTitle() + '</div>')
            .editable(function(value, settings) { 
                ds.opts.title = value;
                return(value);
            })
    );
    // save and close button
    $(this.editpane).append(
        $('<span class="editlink saveds">save &amp; close</span>')
            .click(function() {
                ds.saveAllChanges();
                ds.closeEditMode();
                $(ds.editpane).remove();
            })
    );
    // close button
    $(this.editpane).append(
        $('<span class="editlink closeds">close</span>')
        .click(function() {
            ds.closeEditMode();
            $(ds.editpane).remove();
        })
    );
    // add new item button
    $(this.editpane).append(
        $('<span class="editlink dsadditem">new item</span>')
            .click(function() {
                var item = ds.loadItem({title:"Untitled Item"});
                ds.addEditItem(item, ds.editpane);
            })
    );
    // items
    this.each(function(item) {
        ds.addEditItem(item, ds.editpane);
    });
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
    item.editpane = itemdiv;
    // update div
    item.updateEditPane();
    $(el).append(itemdiv);
}

/**
 * Change the theme for every item in a dataset
 *
 * @param (TimeMapDatasetTheme) theme       New theme settings
 */
 TimeMapDataset.prototype.changeTheme = function(newTheme) {
    this.opts.theme = newTheme;
    this.each(function(item) {
        item.changeTheme(newTheme);
    });
    this.timemap.timeline.layout();
    this.updateEditPane();
 }

/**
 * Update the edit pane version of a timemap item.
 */
TimeMapItem.prototype.updateEditPane = function() {
    if (!this.editpane) return;
    else $(this.editpane).empty();
    var item = this;
    // add existing placemark
    if (this.placemark) {
        // add placemark icon
        switch (this.opts.type) {
            case "marker":
                var iconImg = '<img src="' + this.opts.theme.icon.image + '">';
                break;
            case "polygon":
                var iconImg = '<div style="width:15px; height:15px; border:1px solid #CCCCCC; background:' 
                    + this.opts.theme.color + '">';
                break;
            case "polyline":
                var iconImg = '<div style="width:32px;height:32px;background:' 
                    + this.opts.theme.color + '">' 
                    + '<img src="http://maps.google.com/intl/en_us/mapfiles/ms/line.png"></div>';
            // XXX: handle overlays?
            // XXX: handle arrays?
        }
        $(this.editpane).append(
            $('<div class="itemicon">' + iconImg + '</div>')
                .click(function() {
                    item.dataset.timemap.map.setCenter(item.getInfoPoint());
                    if (item.event) {
                        var topband = item.dataset.timemap.timeline.getBand(0);
                        topband.setCenterVisibleDate(item.event.getStart());
                    }
                })
        );
    } 
    // add title
    $(this.editpane).append(
        $('<div class="itemtitle">' + this.getTitle() + '</div>')
            .editable(function(value, settings) { 
                item.opts.title = value;
                if (item.event) item.event._text = value;
                item.dataset.timemap.refreshTimeline();
                return(value);
            })
    );
    // delete button
    $(this.editpane).append(
        $('<span class="editlink deleteitem">delete</span>')
            .click(function() {
              var ds = item.dataset;
              ds.deleteItem(item);
              ds.updateEditPane();
            })
    );
    // new placemark tools
    if (!this.placemark) {
        // common function: select button
        var selectButton = function(b) {
            $(".pmbutton").removeClass("selected");
            if (b) $(b).addClass("selected");
            if (item.listener) GEvent.removeListener(item.listener);
        };
        // common function: poly drawing
        var startDrawing = function(poly) {
            item.dataset.timemap.map.addOverlay(poly);
            poly.enableDrawing();
            poly.enableEditing({onEvent: "mouseover"});
            poly.disableEditing({onEvent: "mouseout"});
            GEvent.addListener(poly, "endline", function() {
                poly.item = item;
                item.placemark = poly;
                item.opts.infoPoint = poly.getBounds().getCenter();
                GEvent.addListener(poly, "click", function() {
                    item.openInfoWindow();
                });
                item.updateEditPane();
            });
        };
        $(this.editpane).append(
            $('<div class="itemlabel">Add:</div>')
        ).append(
            $('<div class="itempmtools" />').append(
                // new marker button
                $('<div id="markerbutton" class="pmbutton" />').click(function() {
                    selectButton(this);
                    item.listener = GEvent.addListener(item.dataset.timemap.map, "click", function(overlay, latlng) {
                        if (latlng) {
                            GEvent.removeListener(item.listener);
                            item.placemark = new GMarker(latlng, {icon: item.opts.theme.icon});
                            item.opts.type = "marker";
                            item.enablePlacemarkEdits();
                            item.updateEditPane();
                        }
                    });

                })
            ).append(
                // new polyline button
                $('<div id="polylinebutton" class="pmbutton" />').click(function() {
                    selectButton(this);
                    item.listener = GEvent.addListener(item.dataset.timemap.map, "click", function(overlay, latlng) {
                        if (latlng) {
                            GEvent.removeListener(item.listener);
                            item.opts.type = "polyline";
                            startDrawing(new GPolyline([latlng], 
                                item.opts.theme.lineColor, 
                                item.opts.theme.lineWeight,
                                item.opts.theme.lineOpacity)
                            );
                        }
                    });
                })
            ).append(
                // new polygon button
                $('<div id="polygonbutton" class="pmbutton" />').click(function() {
                    selectButton(this);
                    item.listener = GEvent.addListener(item.dataset.timemap.map, "click", function(overlay, latlng) {
                        if (latlng) {
                            GEvent.removeListener(item.listener);
                            item.opts.type = "polygon";
                            startDrawing(new GPolygon([latlng], 
                                item.opts.theme.polygonLineColor, 
                                item.opts.theme.polygonLineWeight,
                                item.opts.theme.polygonLineOpacity,
                                item.opts.theme.fillColor,
                                item.opts.theme.fillOpacity)
                            );
                        }
                    });
                })
            )
        );
    }
    // add start time
    var startDate = this.event ?
        item.dataset.timemap.formatDate(this.event.getStart()) : "";
    $(this.editpane).append(
        $('<div class="itemlabel">Start:</div>')
    ).append(
        $('<div class="itemdate">' + startDate + '</div>')
            .editable(function(value, settings) {
                var s = item.dataset.opts.dateParser(value);
                // check for invalid dates
                if (s == null) {
                    return item.event ? 
                        item.dataset.timemap.formatDate(item.event.getStart()) : "";
                }
                // create the event if it doesn't exist
                if (!item.event) item.createEvent(s);
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
            }, { placeholder: '<span class="missingelement">(add start date)</span>' })
    );
    // add end time
    var endDate = this.event && !this.event.isInstant() ? 
        item.dataset.timemap.formatDate(this.event.getEnd()) : "";
    $(this.editpane).append(
        $('<div class="itemlabel">End:</div>')
    ).append(
        $('<div class="itemdate">' + endDate + '</div>')
            .editable(function(value, settings) {
                var e = item.dataset.opts.dateParser(value);
                // check for invalid dates
                if (e == null) {
                    return item.event && !item.event.isInstant() ?
                        item.dataset.timemap.formatDate(item.event.getEnd()) : "";
                }
                // create the event if it doesn't exist
                if (!item.event) item.createEvent(e);
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
    $(this.editpane).append(
        $('<div class="itemdesc">' + this.opts.description + '</div>')
            .editable(function(value, settings) {
                item.opts.infoHtml = false;
                item.opts.description = value;
                return(value);
            }, { 
                type: 'textarea',
                rows: 5,
                onblur: 'ignore',
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
                icon: this.opts.theme.icon,
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
                icon: this.opts.theme.icon
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
            this.placemark.disableEditing({onEvent: "mouseover"});
            break;
    }
}

/**
 * Create a new event for the item.
 * XXX: Should this be in the main library?
 * 
 * @param (Date) s      Start date for the event
 * @param (Date) e      (Optional) End date for the event
 */
TimeMapItem.prototype.createEvent = function(s, e) {
    var instant = (e == undefined);
    var eventIcon = this.opts.theme.eventIcon;
    var title = this.getTitle();
    // create event
    var event = new Timeline.DefaultEventSource.Event(s, e, null, null, instant, title, 
        null, null, null, this.opts.theme.eventIcon, this.opts.theme.eventColor, null);
    // add references
    event.item = this;
    this.event = event;
    this.dataset.eventSource.add(event);
}
 
 /**
 * Change the theme for an item
 *
 * @param theme   New theme settings
 */
 TimeMapItem.prototype.changeTheme = function(newTheme) {
    this.opts.theme = newTheme;
    // change placemark
    if (this.placemark) {
        // internal function - takes type, placemark
        var changePlacemark = function(pm, type, theme) {
            type = type || TimeMapItem.getPlacemarkType(pm);
            switch (type) {
                case "marker":
                    pm.setImage(theme.icon.image);
                    break;
                case "polygon":
                    pm.setFillStyle({
                        'color': newTheme.fillColor,
                        'opacity': newTheme.fillOpacity
                    });
                    // no break to get stroke style too
                case "polyline":
                    pm.setStrokeStyle({
                        'color': newTheme.lineColor,
                        'weight': newTheme.lineWeight,
                        'opacity': newTheme.lineOpacity
                    });
                    break;
            }
        }
        if (this.getType() == 'array') {
            for (var i=0; i<this.placemark.length; i++) {
                changePlacemark(this.placemark[i], false, newTheme);
            }
        } else {
            changePlacemark(this.placemark, this.getType(), newTheme);
        }
    }
    // change event
    if (this.event) {
        this.event._color = newTheme.eventColor;
        this.event._icon = newTheme.eventIcon;
    }
 }


/** 
 * Identify the placemark type. not 100% happy with this.
 *
 * @param {Object} pm       Placemark to identify
 * @return {String}         Type of placemark, or false if none found
 */
TimeMapItem.getPlacemarkType = function(pm) {
    if ('getIcon' in pm) return 'marker';
    if ('getVertex' in pm) {
        return 'setFillStyle' in pm ? 'polygon' : 'polyline';
    }
    return false;
}

/**
 * Refresh the timeline, maintaining the current date
 */
TimeMap.prototype.refreshTimeline = function () {
    var topband = this.timeline.getBand(0);
    var centerDate = topband.getCenterVisibleDate();
    topband.getEventPainter().getLayout()._laidout = false;
    this.timeline.layout();
    topband.setCenterVisibleDate(centerDate);
}

/**
 * Static utility function - format a date as a string
 *
 * @param d (Date)  Date to format
 * @return (String) Formatted string
 */
TimeMap.prototype.formatDate = function(d) {
    if (d) {
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
    } else return "";
}