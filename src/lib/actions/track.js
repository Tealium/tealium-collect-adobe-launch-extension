'use strict';
var window = require('@adobe/reactor-window');
var loadScript = require('@adobe/reactor-load-script');
var extensionSettings = turbine.getExtensionSettings();

function tealiumEventHandler(event) {
    function getDataObjectHelper(event) {
        turbine.logger.log('Data Object Helper event: ' + JSON.stringify(event));
        var data = window.adobeDataLayer.getState();
        turbine.logger.log('Data Object Helper data: ' + JSON.stringify(data));
        if (data !== null) {
            for (let key in event) {
                if (key == "eventInfo") {
                    for (let k in event[key]) {
                        if (event[key].hasOwnProperty(k)) {
                            data[k] = event[key][k];
                        }
                    }
                } else {
                    data[key] = event[key];
                }
            }
            return data;
        }
    }

    var dataObject = getDataObjectHelper(event);
    if (dataObject !== null) {
        // Capture custom events and built-in: cmp:click, cmp:show, cmp:hide
        if (event.event !== "cmp:loaded") {
            window.tealium.track(event.event, window.tealium.util.flatten(dataObject, 5, true));
        }
    }
}

module.exports = function(settings, event) {
    var eventData = {},
        eventName = event["$rule"].name;

    turbine.logger.log('Tealium Collect settings: ( ' + JSON.stringify(extensionSettings) + ')');

    eventData.dataObject = window[extensionSettings.dataObjectName] || {};
    //if data layer is an array, grab the first element
    if (Array.isArray(eventData.dataObject)) {

        eventData.dataObject = eventData.dataObject[0]; //Can be the first item of the array but if SPA won't be.
        if (event.message) {
            eventData.dataObject = event.message; // Use the latest essage
        }

    }

    // For a "Direct Call" action using _satellite.track, use event.detail for the data layer
    if (event["$type"] === "core.direct-call") {
        eventData.dataObject = event.detail;
    }
    /*
       _satellite.track("direct", {hello:"direct_world"});

       event = {
         "identifier": "direct",
         "detail": {
             "hello": "direct_world"
         },
         "$type": "core.direct-call",
         "$rule": {
             "id": "RL024474b1bce14a04ac3ebd745a83176e",
             "name": "Direct"
         }
       }
    */

    // Create global object before loading tealium.js
    window.tealium = window.tealium || {
        q: []
    };

    if (window.tealium.track === undefined) {
        // Waiting for tealium.js library to finish loading
        turbine.logger.log('Tealium Collect queuing tracking event: ' + eventName);
        window.tealium.q.push(["track", eventName, eventData]);
    } else {
        // No need to queue events when the library has loaded
        turbine.logger.log('Tealium Collect tracking event: ' + eventName);
        window.tealium.track(eventName, eventData);
    }

    // This code will only run once
    if (window.Tealium === undefined) {
        window.Tealium = {};
        turbine.logger.log('Tealium Collect library loading...');

        var collectScript = 'https://tags.tiqcdn.com/libs/tealiumjs/latest/tealium_collect.min.js';
        if (extensionSettings.collectUrl) {
            collectScript = extensionSettings.collectUrl;
        }

        // Both Tealium function and tealium.track function created inside Tealium Collect JS library
        loadScript(collectScript).then(function() {
            var config = [],
                endpoint = extensionSettings.endpoint;

            turbine.logger.log('Tealium Collect library loading complete.');

            // Bug fix for https://example-collect.tealiumiq.com
            if (endpoint && endpoint.indexOf("collect.tealiumiq.com") > 8) {
                endpoint = endpoint.replace("https://", "");
            }

            config.push(["config", "init", [extensionSettings.account, extensionSettings.profile, "prod", extensionSettings.dataSourceKey]]);

            if (window._satellite && window._satellite.environment && window._satellite.environment.stage === "development") {
                config.push(["config", "debug", true]);
            }

            // This will flatten the data layer to prepare for server-side mapping
            config.push(["config", "functions", [{
                id: 1,
                config: {
                    before_rules: true
                },
                f: function(tag, d, t, w) {
                    t.debug(d);
                    // Automatically grab some interesting data from _satellite.buildInfo object
                    // buildDate, environment, turbineBuildDate, turbineVersion
                    if (window._satellite && _satellite.buildInfo) {
                        t.util.merge(d, _satellite.buildInfo);
                    }
                    // Only goes 5 levels deep, non-flattened items will still be references to original
                    // Two rounds of "flatten" to help with W3C data layer arrays of multi-level objects
                    t.util.merge(d, t.util.flatten(t.util.flatten(d.dataObject, 5, true), 5, true));

                    // Remove reference to original object
                    d.dataObject = extensionSettings.dataObjectName;
                    t.debug(d);

                    return true;
                }
            }]]);

            config.push(["config", "addTag", {
                name: "tealium_collect",
                server: endpoint
            }]);

            // Process queue of events and create new global tealium object with tealium.track function defined
            window.tealium = window.Tealium(config.concat(window.tealium.q));

            // If enabled, add code to listen for events on adobeDataLayer.push calls
            if (extensionSettings.addEventListenerACDL) {
                window.adobeDataLayer = window.adobeDataLayer || [];
                window.adobeDataLayer.push(function(dl) {
                    dl.addEventListener("adobeDataLayer:event", tealiumEventHandler);
                });
            }
        });
    }

};
