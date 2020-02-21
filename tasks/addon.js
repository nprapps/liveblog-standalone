// create a bundle of some NPM libs for the add-on

module.exports = function(grunt) {

  var babel = require("babelify");
  var browserify = require("browserify");
  var fs = require("fs");

  grunt.registerTask("bundle-addon", "Build NPM modules for Google Apps Script", function() {
    var done = this.async();

    var b = browserify("tasks/lib/add-on-seed.js", { standalone: "npm" });
    b.transform("babelify", { global: true, presets: [
      ["@babel/preset-env", {
        targets: { browsers: ["ie >= 8"]},
        loose: true,
        modules: false
      }]
    ]});

    var output = fs.createWriteStream("add-on/npm.js");

    var assembly = b.bundle();

    assembly.on("error", function(err) {
      console.log(err);
      grunt.log.errorlns(err.message);
      done();
    });

    assembly.pipe(output).on("finish", () => done());

  });

};
