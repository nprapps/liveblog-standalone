// element functions (p, h3, h2) come from posts.gs, where they're used to add post

var embedTemplates = {
  twitter: '<twitter-embed href="%tweet" id="tw-%counter">\n</twitter-embed>',
  image: '<image-embed src="%src" credit="%credit" id="img-%counter">\n</image-embed>',
  sidechain: '<side-chain src="%src" id="sidechain-%counter">\n</side-chain>'
};

var prefixed = {
  image: "src"
};

function openEmbedPanel() {
  var html = HtmlService.createHtmlOutput(template("addEmbedPanel")).setTitle("Configure add-on");
  var ui = DocumentApp.getUi();
  ui.showSidebar(html);
}

function addEmbed(data) {
  var embed = embedTemplates[data.type];
  if (!embed) throw "No template for that embed type";
  data.counter = getCounterValue();
  for (var k in data) {
    var value = data[k];
    if (prefixed[data.type] == k) value = getConfig("mediaPrefix") + value;
    embed = embed.replace("%" + k, value);
  }
  var doc = DocumentApp.getActiveDocument();
  var cursor = doc.getCursor();
  if (!cursor) throw "No cursor found";
  var element = cursor.getElement();
  var offset = cursor.getOffset();
  var text = element.editAsText();
  text.insertText(offset, embed);
  text.setBackgroundColor(offset, offset + embed.length - 1, "#7be6ff");
//  text.setForegroundColor(offset, offset + embed.length - 1, "#33FF33");
}