// runs the liveblog ArchieML through a series of tests, fails if they don't pass

var { typogrify } = require("typogr");
var moment = require("moment-timezone");
moment.fn.zoneName = function() {
  var z = this.zoneAbbr();
  return z.replace(/[SD]/, "");
}

var timezone = "America/New_York";

module.exports = function(grunt) {

  grunt.registerTask("validate", "Checks the liveblog doc structure for errors", function() {

    grunt.task.requires("archieml");

    var slugs = new Set();

    var { config, posts } = grunt.data.archieml.liveblog;

    if (!config || !posts) {
      grunt.fail.fatal("Missing config or posts section!");
    }

    var fail = function(error, data) {
      if (data) console.log(JSON.stringify(data, null, 2));
      grunt.fail.fatal(error);
    }

    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      post.index = i;
      // check for required non-empty fields
      var fields = ["headline", "slug", "text", "author", "published"];
      for (var required of fields) {
        if (!required in post) {
          fail(`Missing field ${required}!`, post);
        }
        // if (!post[required].trim()) {
        //   fail(`Field ${required} is empty`, post);
        // }
      }

      // make sure the multiline fields didn't absorb other fields
      if (post.headline.match(/text::|slug:/i)) {
        fail(`Post "${post.headline.split("\n").shift()}" is probably missing a ::headline tag`);
      }
      if (post.text.match(/headline::|slug:/i)) {
        fail(`Post ${post.slug} is probably missing a ::text tag`);
      }

      // no duplicate slugs
      if (slugs.has(post.slug)) {
        fail(`Duplicate slug: ${post.slug}`);
      }
      slugs.add(post.slug);

      // create and check dates
      // only do this one time through the template
      var { published } = post;
      published = published.trim();
      if (!published || published == "false") {
        post.published = false;
      } else {
        var parsed = moment(published, moment.ISO_8601).tz(timezone);
        if (!parsed.isValid()) {
          fail(`Date value "${published}" on ${post.slug} is not a valid ISO8601 date.`)
        }
        post.published = parsed;
      }
      if (post.published) {
        post.timeString = post.published.format("h:mm a zz").replace(/\b([ap])m\b/, "$1.m.");
        post.dateString = post.published.format("MMM. D, YYYY");
        if (post.published.isAfter()) {
          post.timeString += " (scheduled)"
        }
      }

      // handle tags
      if ("tags" in post) {
        post.tags = post.tags.split(/,\s*/g);
      } else {
        post.tags = [];
      }

      // Add a JS-free alternative to image-embeds
      post.text = post.text.replace(/<image-embed[\s\S]+?src="(.*?)"[\s\S]+?<\/image-embed>/g, function(all, src) {
        return all + `<noscript><img loading="lazy" src="${src}" alt=""></noscript>`
      });
    }


  });

};