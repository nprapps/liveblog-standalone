/*

Build HTML files using any data loaded onto the shared state. See also loadCSV
and loadSheets, which import data in a compatible way.

*/

var path = require("path");
var typogr = require("typogr");
var template = require("./lib/template");

module.exports = function(grunt) {

  var process = function(source, data, filename) {
    var fn = template(source, { imports: { grunt: grunt, require: require }, sourceURL: filename });
    var input = Object.create(data || grunt.data);
    input.t = grunt.template
    return fn(input);
  };

  //expose this for other tasks to use
  grunt.template.process = process;

  grunt.template.formatNumber = function(s) {
    s = s + "";
    var start = s.indexOf(".");
    if (start == -1) start = s.length;
    for (var i = start - 3; i > 0; i -= 3) {
      s = s.slice(0, i) + "," + s.slice(i);
    }
    return s;
  };

  grunt.template.formatMoney = function(s) {
    s = grunt.template.formatNumber(s);
    return s.replace(/^(-)?/, function(_, captured) { return (captured || "") + "$" });
  };

  grunt.template.smarty = function(text) {
    var filters = ["amp", "widont", "smartypants", "ord"];
    filters = filters.map(k => typogr[k]);
    var filtered = filters.reduce((t, f) => f(t), text);
    return filtered;
  };

  grunt.template.include = function(where, data) {
    grunt.verbose.writeln(" - Including file: " +  where);
    var file = grunt.file.read(path.resolve("src/", where));
    var templateData = Object.create(data || grunt.data);
    templateData.t = grunt.template;
    return process(file, templateData, where);
  };

  grunt.registerTask("build", "Processes index.html using shared data (if available)", function() {

    // skip HTML build if the liveblog hasn't changed
    // THIS BREAKS SCHEDULED POSTS
    if (grunt.option("requireUpdate") && grunt.updated && !grunt.updated.liveblog) {
      grunt.log.writeln("Liveblog hasn't changed, skipping build");
      return;
    }

    var files = grunt.file.expandMapping(["**/*.html", "!**/_*.html", "!js/**/*.html"], "build", { cwd: "src" });
    var data = Object.create(grunt.data || {});
    data.t = grunt.template;
    files.forEach(function(file) {
      var src = file.src.shift();
      grunt.verbose.writeln("Processing file: " +  src);
      var input = grunt.file.read(src);
      var output = process(input, data, src);
      grunt.file.write(file.dest, output);
    });

    //output sharecards
    var posts = grunt.data.archieml.liveblog.posts.filter(p => p.published);
    var share = template(grunt.file.read("src/_sharecard.html"));
    posts.forEach(function(post) {
      var { slug } = post;
      var there = grunt.data.json.project.url;
      var firstImage = post.text.match(/http.+?.(jpg|png|gif)/);
      var socialImage = grunt.data.archieml.liveblog.config.socialImage;
      var defaultImage = there + grunt.data.json.project.image;
      var data = Object.assign({}, post, {
        there,
        here: `${there}share/${slug}.html`,
        lede: post.text.trim().split("\n").shift().replace(/<[^>]+>/g, ""),
        image: firstImage ? firstImage[0] : (socialImage || defaultImage)
      });
      var output = share(data);
      grunt.log.writeln(`Generated share card: share/${slug}.html`);
      grunt.file.write(`build/share/${slug}.html`, output);
    });

    // also create a public RSS feed
    var doc = grunt.data.archieml.liveblog
    var rss = template(grunt.file.read("src/feed.rss"))(data);
    grunt.file.write("build/feed.rss", rss);
  });

}