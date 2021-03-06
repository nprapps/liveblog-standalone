var { google } = require("googleapis");
var async = require("async");
var os = require("os");
var path = require("path");
var { authenticate } = require("./googleauth");

module.exports = function(grunt) {
  grunt.registerTask(
    "docs",
    "Load Google Docs into the data folder",
    function() {
      var config = grunt.file.readJSON("project.json");
      var auth = null;
      try {
        auth = authenticate();
      } catch (err) {
        console.log(err);
        return grunt.fail.warn(
          "Couldn't load access token for Docs, try running `grunt google-auth`"
        );
      }

      var done = this.async();

      var docs = google.docs({ auth, version: "v1" }).documents;

      var formatters = {
        link: (text, style) => `[${text}](${style.link.url})`,
        bold: (text) => `<b>${text}</b>`,
        italic: (text) => `<i>${text}</i>`
      };

      var isNewLine = (paragraph) =>
        paragraph.elements.length == 1 &&
        paragraph.elements[0].textRun.content == "\n";

      /*
       * Large document sets may hit rate limits; you can find details on your quota at:
       * https://console.developers.google.com/apis/api/drive.googleapis.com/quotas?project=<project>
       * where <project> is the project you authenticated with using `grunt google-auth`
       */
      async.eachLimit(
        Object.keys(config.docs),
        2, // adjust this up or down based on rate limiting
        async function(key) {
          var documentId = config.docs[key];
          var suggestionsViewMode = "PREVIEW_WITHOUT_SUGGESTIONS";
          var docResponse = await docs.get({ documentId, suggestionsViewMode });
          console.log(`Got document response for ${key}`);
          var name = key + ".docs.txt";
          var body = docResponse.data.body.content;
          var text = "";

          var lists = docResponse.data.lists;
          var wasBlockQuote = false;

          body.forEach(function(block, index) {
            if (!block.paragraph) return;
            if (isNewLine(block.paragraph)) return;
            if (block.paragraph.bullet) {
              var list = lists[block.paragraph.bullet.listId];
              var level = block.paragraph.bullet.nestingLevel || 0;
              var style = list.listProperties.nestingLevels[level];
              var bullet = "- ";
              if (style) {
                if (style.glyphType == "DECIMAL") {
                  bullet = "1. ";
                }
              }
              var indent = "  ".repeat(level);
              text += indent + bullet;
            }

            var isBlockQuote =
              block.paragraph.paragraphStyle.indentStart &&
              block.paragraph.paragraphStyle.indentFirstLine.magnitude && 
              !block.paragraph.bullet;
            if (isBlockQuote && !wasBlockQuote) {
              text += "<blockquote>\n\n";
            } else if (!isBlockQuote && wasBlockQuote) {
              text += "</blockquote>\n\n";
            }

            var p = "";

            block.paragraph.elements.forEach(function(element, index) {
              if (!element.textRun) return;
              var { content, textStyle } = element.textRun;
              if (content.replace(/[ \t\r]+/g, ""))
                for (var f in formatters) {
                  if (textStyle[f]) {
                    var [_, before, inside, after] = content.match(
                      /^(\s*)(.*?)(\s*)$/
                    );
                    content = before + formatters[f](inside, textStyle) + after;
                  }
                }
              p += content;
            });
            text += p + "\n";
            wasBlockQuote = isBlockQuote;
          });

          if (wasBlockQuote) {
            text += "</blockquote>\n\n";
          }
          text = text.replace(/\x0b/g, "\n");
          // text = text.replace(/\n{2,}/g, "\n\n");

          console.log(`Writing document as data/${name}`);
          grunt.file.write(path.join("data", name), text);
        },
        function(err) {
          if (err) {
            console.log("Uncaught error in docs:");
            console.log(err);
          }
          done();
        }
      );
    }
  );
};
