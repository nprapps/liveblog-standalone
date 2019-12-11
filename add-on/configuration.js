var props = PropertiesService.getDocumentProperties();

var configDefaults = {
  authorSheet: "1s0Vs4c41kp8mCvGnIFbdPK9YI9t18u0c2kvh6W1eZBw",
  mediaPrefix: "https://media.npr.org/assets/liveblog/liveblog_slug_here/"
};

function openConfigPanel() {
  var existing = props.getProperties();
  var merged = {};
  for (var k in configDefaults) {
    merged[k] = existing[k] || configDefaults[k];
  }
  var html = HtmlService.createHtmlOutput(template("configPanel", merged)).setTitle("Configure add-on");
  var ui = DocumentApp.getUi();
  ui.showSidebar(html);
}

function setConfig(values) {
  for (var k in values) {
    props.setProperty(k, values[k]);
  }
}

function getConfig(key) {
  return props.getProperty(key);
}