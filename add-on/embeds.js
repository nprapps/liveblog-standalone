// element functions (p, h3, h2) come from posts.gs, where they're used to add post

var embeds = {
  twitter: '<twitter-embed href="%tweet" id="tw-%counter">\n</twitter-embed>',
  nprvideo: '<npr-video media="%media" id="nprvideo-%counter">\n</npr-video>',
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
  showmore: '<show-more text="%text" id="show-more-%counter">\n</show-more>',
  youtube: {
    template: '<youtube-video video="%video" id="youtube-counter-%counter">\n</youtube-video>',
    process: function(data) {
      if (data.video.match(/\?.*?v=/)) {
        data.video = data.video.match(/v=([^&]+)/)[1];
      }
    }
  },
  election: {
    template: '<side-chain src="%src" id="primary-%counter">\n</side-chain>',
    process: function(data) {
      var segments = data.election.split(":");
      var office = segments[0];
      var file = segments[1];
      var state = segments[2];
      var caucus = segments[3];
      data.src = [
        "https://apps.npr.org/elections20-primaries/embeds/?theme=padded&race=",
        caucus ? "C" : office,
        "&data=",
        file,
        "&link=https://apps.npr.org/elections20-primaries/states/",
        state,
        ".html"
      ].join("");
    }
  }
};

function openEmbedPanel() {
  var races = readSheetAsObjects("1OQjETCNrojeOulPutjoSX2mb8ZDvY_eBTU7N2XbQNCM", "races");
  races = races.filter(function(r) { return !r.feedOnly && r.office != "R" });
  var html = HtmlService.createHtmlOutput(template("addEmbedPanel", { races: races })).setTitle("Configure add-on");
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
  var body = doc.getBody();
  var cursor = doc.getCursor();
  if (!cursor) throw "No cursor found";
  var element = cursor.getElement();
  var index = body.getChildIndex(element);
  var offset = cursor.getOffset();
  var text = element.editAsText();
  text.insertText(offset, t + "");
  text.setBackgroundColor(offset, offset + t.length - 1, "#7be6ff");
  body.insertParagraph(index + 1, "");
  body.insertParagraph(index, "");
//  text.setForegroundColor(offset, offset + embed.length - 1, "#33FF33");
}