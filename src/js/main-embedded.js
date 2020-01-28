require("./liveblog");
var events = require("./events");

var Sidechain = require("@nprapps/sidechain");

var guest = Sidechain.registerGuest({
  sentinel: "npr-liveblog"
});

events.on("unseen-posts", function(unseen) {
  // update the host page
  guest.sendMessage({ unseen });
  // update Pym parents
  // the loader keeps a running total, which is dumb, so we send two
  guest.sendLegacy("update-parent-title", 0);
  guest.sendLegacy("update-parent-title", unseen);
});

//handle internal links
document.body.addEventListener("click", function(e) {
  var link = e.target.closest("a");
  if (link) {
    var href = link.getAttribute("href");
    if (href[0] == "#") {
      e.preventDefault();
      e.stopImmediatePropagation();
      var element = document.querySelector(href);
      if (element) {
        if (navigator.userAgent.match(/safari/) || true) {
          // safari is bad, scroll the parent manually there
          var scrollY = element.getBoundingClientRect().top;
          // for Pym hosts
          guest.sendLegacy("scrollToChildPos", scrollY);
          // Sidechain hosts
          guest.sendMessage({ scrollY });
        } else {
          // standard browsers can just move the way we want them to
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
  }
});