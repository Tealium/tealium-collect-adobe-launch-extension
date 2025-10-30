'use strict';
var window = require('@adobe/reactor-window');
var loadScript = require('@adobe/reactor-load-script');
var extensionSettings = turbine.getExtensionSettings();

// Ensures Tealium Collect is loaded once, then resolves.
function ensureTealiumLoaded(settings) {
  return new Promise(function(resolve) {
    // Already loaded and ready?
    if (window.tealium && typeof window.tealium.track === 'function') return resolve();

    // Create queue and load once per page
    window.tealium = window.tealium || { q: [] };

    if (!window.Tealium) {
      window.Tealium = {}; // sentinel to avoid duplicate loads

      var collectScript = settings.collectUrl || 'https://tags.tiqcdn.com/libs/tealiumjs/latest/tealium_collect.min.js';
      loadScript(collectScript).then(function() {
        var endpoint = settings.endpoint;

        // Normalize "https://collect.tealiumiq.com" or similar
        if (endpoint && endpoint.indexOf('collect.tealiumiq.com') > 8) {
          endpoint = endpoint.replace('https://', '');
        }

        var config = [];
        config.push(['config', 'init', [settings.account, settings.profile, 'prod', settings.dataSourceKey]]);

        // Enable debug in Dev environments
        if (window._satellite && window._satellite.environment && window._satellite.environment.stage === 'development') {
          config.push(['config', 'debug', true]);
        }

        // Optional: flatten helper similar to your existing implementation
        config.push(['config', 'functions', [{
          id: 1,
          config: { before_rules: true },
          f: function(tag, d, t) {
            try {
              if (window._satellite && _satellite.buildInfo) {
                t.util.merge(d, _satellite.buildInfo);
              }
              if (d && d.dataObject && typeof d.dataObject === 'object') {
                // Two-pass flatten (5 levels) for nested structures
                t.util.merge(d, t.util.flatten(t.util.flatten(d.dataObject, 5, true), 5, true));
              }
            } catch (e) {}
            return true;
          }
        }]]);

        config.push(['config', 'addTag', { name: 'tealium_collect', server: endpoint }]);

        // Initialize Tealium and drain any queued events
        window.tealium = window.Tealium(config.concat(window.tealium.q));
        resolve();
      }).catch(function(err){
        turbine.logger && turbine.logger.error('Tealium Collect load failed', err);
        resolve();
      });
    } else {
      // If the factory exists but track isn't ready yet, poll briefly
      var waited = 0, i = setInterval(function() {
        if (window.tealium && typeof window.tealium.track === 'function') {
          clearInterval(i); resolve();
        } else if ((waited += 20) > 3000) { // 3s cap
          clearInterval(i);
          turbine.logger && turbine.logger.warn('Tealium track not ready after 3s; continuing with queue.');
          resolve();
        }
      }, 20);
    }
  });
}

// Action: Send ACDL push payload to Tealium Collect
module.exports = function(settings, event) {
  // ACDL provides the pushed object on event.message
  var message = event && typeof event.message === 'object' && !Array.isArray(event.message)
    ? event.message
    : {};
  var evtName = message.event || message.type || message.eventName || extensionSettings.defaultEventName || 'acdl_event';

  // Build payload; include account/profile/datasource from settings
  var payload = {
    tealium_account: extensionSettings.account,
    tealium_profile: extensionSettings.profile,
    tealium_datasource: extensionSettings.dataSourceKey,
    dataObject: message // <- the object that was just pushed
  };

  // Load Tealium Collect if needed, then send
  return ensureTealiumLoaded(extensionSettings).then(function() {
    if (window.tealium && typeof window.tealium.track === 'function') {
      window.tealium.track(evtName, payload);
    } else {
      // Extremely rare fallback; queue until ready
      window.tealium = window.tealium || { q: [] };
      window.tealium.q.push(['track', evtName, payload]);
    }
  });
};
