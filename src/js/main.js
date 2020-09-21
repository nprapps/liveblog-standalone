require("./liveblog");
require("./ads");
var { track, trackApps } = require("./lib/tracking");
var events = require("./events");
var $ = require("./lib/qsa");

// update title
events.on("unseen-posts", function(count) {
  var clean = document.title.replace(/^\s*\(\d+\)\s*/, "");
  document.title = count ? `(${count}) ${clean}` : clean;
});

events.on("clicked-unseen", function() { 
  $.one(".post.published").scrollIntoView({ behavior: "smooth" });
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
    trackApps("jump-on-load", hash.slice(1));
  }
}, 2000);

document.body.addEventListener("click", function(e) {
  var link = e.target.closest("a");
  if (!link) return;
  var href= link.getAttribute("href");
  if (href[0] != "#") return;
  trackApps("internal-link-clicked", href.slice(1));
});

var trackGlobalNav = function(e) {
  var href = this.href;
  var text = this.innerText || "logo";
  track("global navigation", `clicked ${text}`, href);
};

$("nav .primary a").forEach(el => el.addEventListener("click", trackGlobalNav));