require("./liveblog");
require("./ads");
var track = require("./lib/tracking").trackApps;
var events = require("./events");
var $ = require("./lib/qsa");

// update title
events.on("unseen-posts", function(count) {
  var clean = document.title.replace(/^\s*\(\d+\)\s*/, "");
  document.title = count ? `(${count}) ${clean}` : clean;
});

events.on("clicked-unseen", function() { 
  $.one(".post").scrollIntoView({ behavior: "smooth" });
});

// catch slow rendering jumps
setTimeout(function() {
  var hash = window.location.hash;
  if (hash) {
    // unbreak SocialFlow links
    hash = hash.replace(/\?.+$/, "");
    window.location = hash;
    var element = $.one(hash);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    track("jump-on-load", hash.slice(1));
  }
}, 2000);

document.body.addEventListener("click", function(e) {
  var link = e.target.closest("a");
  if (!link) return;
  var href= link.getAttribute("href");
  if (href[0] != "#") return;
  track("internal-link-clicked", href.slice(1));
});

