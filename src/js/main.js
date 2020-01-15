require("./liveblog");
require("./ads");
var events = require("./events");

// update title
events.on("unseen-posts", function(count) {
  var clean = document.title.replace(/^\s*\(\d+\)\s*/, "");
  document.title = count ? `(${count}) ${clean}` : clean;
});