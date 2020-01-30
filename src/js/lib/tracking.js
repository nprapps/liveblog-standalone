//module for interfacing with GA

/**
@param [category] - usually "interaction"
@param action - what happened
@param [label] - not usually visible in dashboard, defaults to title or URL
*/

var DIMENSION_PARENT_URL = 'dimension1';
var DIMENSION_PARENT_HOSTNAME = 'dimension2';
var DIMENSION_PARENT_INITIAL_WIDTH = 'dimension3';

var slug = window.location.pathname.split("/").filter(p => p && !p.match(/\.html$/)).pop();

var track = function(eventCategory, eventAction, eventLabel, eventValue, extra) {
  var event = {
    eventCategory,
    eventAction,
    eventLabel,
    eventValue,
    hitType: "event"
  };

  console.log(`Tracking: ${eventCategory} / ${eventAction} / ${eventLabel} / ${eventValue}`)

  var here = new URL(window.location);
  var parentURL = here.searchParams.get("parentURL");

  if (parentURL) {
    var p = new URL(parentURL);
    event[DIMENSION_PARENT_URL] = parentURL;
    event[DIMENSION_PARENT_HOSTNAME] = p.hostname;
  }

  if (extra) Object.assign(event, extra);

  if (window.ga) ga("send", event);
}

var trackApps = function(eventAction, eventLabel, eventValue) {
  track("apps-" + slug, eventAction, eventLabel, eventValue);
};

module.exports = { track, trackApps };
