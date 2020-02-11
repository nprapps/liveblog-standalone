
function onOpen() {
  Logger.log("opened!");
  var ui = DocumentApp.getUi();
  var menu = ui.createMenu("Liveblog");
  menu.addItem("Add post", "openDraftPanel");
  menu.addItem("Add embed", "openEmbedPanel");
  menu.addItem("Publish post", "publishPost");
  menu.addItem("Set custom publication time", "publishLater");
  menu.addSeparator();
  // menu.addItem("Check document for errors", "checkDocument");
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

function checkDocument() {
  var doc = DocumentApp.getActiveDocument();
  var body = doc.getBody();
  var text = body.getText();
  
  // ignore false-positive keys inside of post text blocks
  var multiline = ["text", "headline"];
  multiline.forEach(function(m) {
    var replacer = new RegExp("^" + m + ": ?$([\\s\\S]*?):end$", "gm");
    text = text.replace(replacer, function(all, inner) {
      return [m, ":", inner.replace(/^(\S+:)/gm, "\\$1"), ":end"].join("");
    });
  });
  
  
  // force fields to be lower-case
  text = text.replace(/^[A-Z]\w+\:/gm, function(w) { return w[0].toLowerCase() + w.slice(1) });
  
  var parsed = archieml.load(text);
  
  if (!parsed) throw "Document couldn't be parsed - talk to a dev";
  
  if (!parsed.config) throw "Document is missing a {config} section at the top";
  if (!parsed.posts) throw "Document is missing a [posts] section";
  
  parsed.posts.forEach(function(p, i) {
    var required = "headline author text published slug".split(" ");
    required.forEach(function(r) {
      if (!(r in p) || !p[r].trim()) {
        throw "Post #" + i + " (" + (p.headline || p.slug) + ") is missing field " + r;
      }
    });
    
    // check for overflow
    if (p.text.match(/^headline:/m)) {
      throw p.slug + " may be missing a :end tag";
    }
    
    // check dates
    if (p.published.trim() != "false") {
      // 2020-01-31T16:40:41.448Z
      if (!p.published.trim().match(/^\d{4}-\d{2}-\d{2}T\d{1,2}:\d{2}:\d{2}.\d+Z$/)) {
        throw p.slug + " timestamp doesn't seem to match required date format";
      }
      try {
        Date.parse(p.published.trim());
      } catch (err) {
        throw p.slug + " - date couldn't be parsed";
      }
    }
  });
}