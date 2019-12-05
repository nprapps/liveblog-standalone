var { typogrify } = require("typogr");

module.exports = function(grunt, text) {
  var { renderMarkdown } = grunt.template;
  return renderMarkdown(text);
}