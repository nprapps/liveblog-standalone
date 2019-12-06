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
      // force fields to be lower-case
      contents = contents.replace(/^[A-Z]\w+\:/gm, w => w[0].toLowerCase() + w.slice(1));
      var parsed = archieml.load(contents);
      grunt.data.archieml[name] = parsed;
    });

  });

};