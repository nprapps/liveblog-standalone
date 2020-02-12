// element functions (p, h3, h2) come from posts.gs, where they're used to add post

var embeds = {
  twitter: '<twitter-embed href="%tweet" id="tw-%counter">\n</twitter-embed>',
  image: {
    template: '<image-embed src="%src" credit="%credit" %href %narrow id="img-%counter">\n</image-embed>',
    process: function(data) {
      data.src = getConfig("mediaPrefix") + data.src;
      data.narrow = data.narrow ? "narrow" : "";
      data.href = "";
      if (data.link) {
        data.href = 'href="' + data.link + '"';
      }
    }
  },
  sidechain: {
    template: '<side-chain src="%src" id="sidechain-%counter">\n</side-chain>',
    process: function(data) {
      data.src = data.src.replace(/preview.html$/, "");
    }
  },
  youtube: {
    template: '<youtube-video video="%video" id="youtube-counter-%counter">\n</youtube-video>',
    process: function(data) {
      if (data.video.match(/\?.*?v=/)) {
        data.video = data.video.match(/v=([^&]+)/)[1];
      }
    }
  }
};

function openEmbedPanel() {
  var html = HtmlService.createHtmlOutput(template("addEmbedPanel")).setTitle("Configure add-on");
  var ui = DocumentApp.getUi();
  ui.showSidebar(html);
}

function addEmbed(data) {
  Logger.log(data);
  var embed = embeds[data.type];
  if (!embed) throw "No template for that embed type";
  var t = embed.template || embed;
  var process = embed.process || noop;
  data.counter = getCounterValue();
  process(data);
  for (var k in data) {
    var value = k in data ? data[k] : "";
    t = t.replace("%" + k, value);
  }
  var doc = DocumentApp.getActiveDocument();
  var cursor = doc.getCursor();
  if (!cursor) throw "No cursor found";
  var element = cursor.getElement();
  var offset = cursor.getOffset();
  var text = element.editAsText();
  text.insertText(offset, t + "\n");
  text.setBackgroundColor(offset, offset + t.length - 1, "#7be6ff");
//  text.setForegroundColor(offset, offset + embed.length - 1, "#33FF33");
}