// runs the liveblog ArchieML through a series of tests, fails if they don't pass

var { typogrify } = require("typogr");

module.exports = function(grunt) {

  grunt.registerTask("validate", "Checks the liveblog doc structure for errors", function() {

    grunt.task.requires("archieml");

    var { liveblog, backup } = grunt.data.archieml;

    try {

      var slugs = new Set();

      var { config, posts } = liveblog;

      if (!config || !posts) {
        throw "Missing config or posts section!";
      }

      for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        post.index = i;
        // check for required non-empty fields
        var fields = ["headline", "slug", "text", "author", "published"];
        for (var required of fields) {
          if (!required in post) {
            throw `Missing field ${required} for ${post.slug || post.headline || "#" + i}!`;
          }
          // if (!post[required].trim()) {
          //   fail(`Field ${required} is empty`, post);
          // }
        }

        // make sure the multiline fields didn't absorb other fields
        if (post.headline.match(/text::|slug:/i)) {
          throw `Post "${post.headline.split("\n").shift()}" is probably missing a ::headline tag`;
        }
        if (post.text.match(/headline::|slug:/i)) {
          throw `Post ${post.slug} is probably missing a ::text tag`;
        }

        // no duplicate slugs
        if (slugs.has(post.slug)) {
          throw `Duplicate slug: ${post.slug}`;
        }
        slugs.add(post.slug);

        // create and check dates
        // only do this one time through the template
        var { published } = post;
        if (typeof published == "string") {
          throw `Publish date value for ${post.slug} couldn't be parsed`;
        }
      }

      // make a copy of the document
      grunt.file.copy("data/liveblog.docs.txt", "data/backup.docs.txt");

    } catch (err) {
      console.log(`Liveblog parse error: ${err}`);
      if (backup) {
        console.log(`Restoring from last known good copy`);
        grunt.data.archieml.liveblog = backup;
      } else {
        grunt.fail.fatal("No backup found, unable to continue.")
      }
    }

    // process post text
    grunt.data.archieml.liveblog.posts.forEach(function(post) {
      if (post.published && post.published.format) {
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
    });


  });

};