require("./liveblog");
require("./ads");
var track = require("./lib/tracking").trackApps;
var events = require("./events");

// update title
events.on("unseen-posts", function(count) {
  var clean = document.title.replace(/^\s*\(\d+\)\s*/, "");
  document.title = count ? `(${count}) ${clean}` : clean;
});

// catch slow rendering jumps
setTimeout(function() {
  var hash = window.location.hash;
  if (hash) {
    window.location = hash;
    var element = document.querySelector(hash);
    if (element);
    element.scrollIntoView({ behavior: "smooth" });
  }
}, 2000);

document.body.addEventListener("click", function(e) {
  var link = e.target.closest("a");
  if (!link) return;
  var href= link.getAttribute("href");
  if (href[0] != "#") return;
  track("internal-link-clicked", href.slice(1));
});