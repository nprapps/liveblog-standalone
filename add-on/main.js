
function onOpen() {
  Logger.log("opened!");
  var ui = DocumentApp.getUi();
  var menu = ui.createMenu("Liveblog");
  menu.addItem("Add post", "openDraftPanel");
  menu.addItem("Add embed", "openEmbedPanel");
  menu.addItem("Set publication time", "publishPost");
  menu.addItem("Schedule later publication", "publishLater");
  menu.addSeparator();
  menu.addItem("Configure liveblog add-on", "openConfigPanel");
  menu.addItem("Reset document", "resetDocument");
  menu.addToUi();
}

function noop() {
  
}

function resetDocument() {
  var ui = DocumentApp.getUi();
  var confirmed = ui.alert("Are you sure? This will erase the whole document.", ui.ButtonSet.YES_NO);
  if (confirmed != ui.Button.YES) return;
  var reconfirmed = ui.alert("Are you really, really sure?", ui.ButtonSet.YES_NO);
  if (reconfirmed != ui.Button.YES) return;
  
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