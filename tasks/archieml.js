/*

Process text files as ArchieML
Anything that has a .txt extension in /data will be loaded

*/

var path = require("path");
var archieml = require("archieml");

module.exports = function(grunt) {

  grunt.registerTask("archieml", "Loads ArchieML files from data/*.txt", function() {

    grunt.task.requires("state");
    grunt.data.archieml = {};

    var files = grunt.file.expand("data/*.txt");


    files.forEach(function(f) {
      var name = path.basename(f).replace(/(\.docs)?\.txt$/, "");
      var contents = grunt.file.read(f);

      // trim trailing whitespace
      contents = contents.replace(/(^|\S) +$/gm, "$1");

      // check for greedy text fields
      var textRE = /^text:[\s\S]*?:end/gmi;
      var match;
      while (match = textRE.exec(contents)) {
        var [ t ] = match;
        if (t.match(/^headline:/m)) {
          console.log("=======\n", t.trim(), "\n=======");
          grunt.fail.fatal("Text seems to be missing an :end tag")
        }
      }

      // ignore false-positive keys inside of post text blocks
      var multiline = ["text", "headline"];
      for (var m of multiline) {
        var replacer = new RegExp(`^${m}: ?$([\\s\\S]*?):end$`, "gm");
        contents = contents.replace(replacer, function(all, inner) {
          return `${m}:${inner.replace(/^(\S+:)/gm, "\\$1")}:end`;
        });
      }

      // force fields to be lower-case
      contents = contents.replace(/^[A-Z]\w+\:/gm, w => w[0].toLowerCase() + w.slice(1));

      var parsed = archieml.load(contents);
      grunt.data.archieml[name] = parsed;
    });

  });

};