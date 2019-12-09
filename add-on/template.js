// load a file as a string
// useful from HTML output: `<?!= include("file.html") ?>`
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// use a file to generate text output
// delimiters are the same as the regular Apps Script templates:
// <? JS code ?>
// <?= JS output ?>
// <?!= unsanitized JS output ?>
function template(filename, data) {
  var template = HtmlService.createTemplateFromFile(filename);
  template.data = data;
  return template.evaluate().getContent().trim();
}