
var doc = DocumentApp.getActiveDocument();
var body = doc.getBody();
var headings = DocumentApp.ParagraphHeading;

function openDraftPanel() {
  var sheetID = getConfig("authorSheet");
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
    .split(" ")
    .slice(0, 5)
    .join(" ")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/^[\d]+-/, "") + "-" + getCounterValue();
  
  page();
  p("headline::");
  h3(postData.headline);
  p("::headline");
  if (postData.author == "other") {
    p("author: " + postData.other);
  } else {
    var sheetID = getConfig("authorSheet");
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
  if (postData.major) p("major: true");
  p("text::");
  p();
  var placeholder = p(postData.text || "[ post contents go here ]");
  p();
  p("::text")//.editAsText().setForegroundColor("#FF0000");
  var builder = doc.newRange();
  builder.addElement(placeholder);
  doc.setSelection(builder.build());
}

function publishPost(schedule) {
  var selection = doc.getSelection();
  var cursor = doc.getCursor();
  var now = schedule || new Date();
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

function publishLater() {
  var ui = DocumentApp.getUi();
  
  var dateResponse = ui.prompt("Input a date for the post as MM/DD/YYYY", ui.ButtonSet.OK_CANCEL);
  if (dateResponse.getSelectedButton() == ui.Button.CANCEL) return;
  var date = dateResponse.getResponseText();
  var timeResponse = ui.prompt("Enter the time as 24-hour HH:MM", ui.ButtonSet.OK_CANCEL)
  if (timeResponse.getSelectedButton() == ui.Button.CANCEL) return;
  var time = timeResponse.getResponseText();
  var dateParts = date.split("/");
  var month = parseFloat(dateParts[0]);
  var day = parseFloat(dateParts[1]);
  var year = parseFloat(dateParts[2]);
  var timeParts = time.split(":");
  var hours = parseFloat(timeParts[0]);
  var minutes = parseFloat(timeParts[1]);
  
  var then = new Date(year, month - 1, day, hours, minutes);
  publishPost(then);
}