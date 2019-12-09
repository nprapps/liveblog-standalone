var props = PropertiesService.getScriptProperties();
var doc = DocumentApp.getActiveDocument();
var body = doc.getBody();
var headings = DocumentApp.ParagraphHeading;

function openDraftPanel() {
  var sheetID = props.getProperty("authorSheet");
  var data = {
    authors: sheetID ? readSheetAsObjects(sheetID, "authors") : []
  };
  var html = HtmlService.createHtmlOutput(template("addPostPanel", data)).setTitle("Configure add-on");
  var ui = DocumentApp.getUi();
  ui.showSidebar(html);
}

var h3 = function(text) {
  var p = body.appendParagraph(text);
  p.setHeading(headings.HEADING3);
  return p;
}

var h4 = function(text) {
  var p = body.appendParagraph(text);
  p.setHeading(headings.HEADING4);
  return p;
};

var p = function(text) {
  return body.appendParagraph(text || "");
};

var hr = function() {
  return body.appendHorizontalRule();
};

var propLink = function(property, text, url) {
  var field = property + ": ";
  var p = body.appendParagraph(field + text);
  var content = p.editAsText();
  content.setLinkUrl(field.length, text.length + field.length - 1, url);
  return p;
};

var page = function() {
  return body.appendPageBreak();
}

function addDraftPost(postData) {
  Logger.log(postData);
  if (!postData.headline) throw "No headline provided";
  var slug = postData.headline
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/^[\d]+-/, "") + "-" + getCounterValue();
  
  page();
  h3("headline: " + postData.headline);
  if (postData.author == "other") {
    p("author: " + postData.other);
  } else {
    var sheetID = props.getProperty("authorSheet");
    var authors = readSheetAsObjects(sheetID, "authors");
    var row = authors.filter(function(r) { return r.key == postData.author }).pop();
    p("author: " + row.name);
    if (row.role) p("role: " + row.role);
    if (row.page) p("page: " + row.page);
  }
  h4("published: false");
  h4("editing: draft");
  p("slug: " + slug);
  if (postData.factcheck) p("factcheck: true");
  if (postData.tags) p("tags: " + postData.tags);
  p("text:");
  p();
  var placeholder = p(postData.text || "[ post contents go here ]");
  p();
  p(":end");
  var builder = doc.newRange();
  builder.addElement(placeholder);
  doc.setSelection(builder.build());
}

function publishPost() {
  var selection = doc.getSelection();
  var cursor = doc.getCursor();
  var now = new Date();
  var date = now.toISOString();
  var replacer = "false|\\d[\\dT\\.:-]+Z";
  var element;
  if (selection) {
    var elements = selection.getRangeElements();
    var start = elements[0];
    element = start.getElement();
  } else {
    element = cursor.getElement();
  }
  var text = element.editAsText();
  var content = text.getText();
  if (!content.match(/published: /)) throw "Cursor is not placed on a publish line";
  text.replaceText(replacer, date);
}