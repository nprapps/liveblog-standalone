/*

TODO:
 - Counters for post slugs and embed IDs (maybe just the one counter? Doesn't really matter)
 - Make sure embeds do not insert URLs as links, that will screw up the parser
 - Add highlighting for embeds and HTML code
 - Create a standard document opener, including the link to CommonMark and ArchieML explainers
 - Config panel that loads existing params so that you don't have to debug for them
   - media prefix
   - author sheet
 - Reset doc and properties
 - Internal links are just regular links now


*/

function onOpen() {
  Logger.log("opened!");
  var ui = DocumentApp.getUi();
  var menu = ui.createMenu("Liveblog");
  menu.addItem("Add post", "openDraftPanel");
  menu.addItem("Add embed", "openEmbedPanel");
  menu.addItem("Set publication time", "publishPost");
  menu.addSeparator();
  menu.addItem("Configure liveblog add-on", "openConfigPanel");
  menu.addItem("Reset document", "resetDocument");
  menu.addToUi();
}

function noop() {
  
}

function resetDocument() {
  var blank = include("blankDocument");
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  body.clear();
  appendMD(body, blank);
  resetCounter();
  addDraftPost({
    headline: "Get Caught Up",
    author: "other",
    other: "NPR"
  });
}