// downloads remote files into the build directory for client-side requests
var http = require("http");
var https = require("https");
var fs = require("fs");

var get = function(location) {
  var url = new URL(location);
  return new Promise(function(ok, fail) {
    var request = (url.protocol.match(/https/) ? https : http).get(url);
    request.on("response", function(response) {
      if (response.statusCode >= 400) return fail(response);
      if (response.statusCode >= 300 && response.headers.location) {
        return ok(get(response.headers.location));
      }
      ok(response);
    });
    request.on("error", fail);
  });
};

var pipe = function(input, output) {
  return new Promise(function(ok, fail) {
    input.pipe(output);
    output.on("end", ok);
    output.on("error", fail);
  });
};

module.exports = function(grunt) {

  var proxy = async function(mapping) {
    for (var file in mapping) {
      var url = mapping[file];
      var response = await get(url);
      var out = fs.createWriteStream(`build/proxied/${file}`);
      console.log(response, out);
      await pipe(response, out);
    }
  };

  grunt.registerTask("proxy", "Download remote files into build/proxied", function() {

    var done = this.async();
    var project = grunt.file.readJSON("project.json");

    grunt.file.mkdir("build/proxied");
    proxy(project.proxy).then(done);

  });

}