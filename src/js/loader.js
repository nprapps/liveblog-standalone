var $ = require("./lib/qsa");

// load Sidechain and the legacy browser shim
require("@webcomponents/custom-elements");
var Sidechain = require("@nprapps/sidechain");

// ugh CorePub
var upgrade = function(element) {
  var patch = document.createElement("side-chain");
  patch.setAttribute("src", element.dataset.sidechainSrc);
  element.parentNode.replaceChild(patch, element);
}
$("[data-sidechain-src]").forEach(upgrade);

var observer = new MutationObserver(function(events) {
  events.forEach(function(mutation) {
    if (mutation.type == "childList") {
      var added = Array.from(mutation.addedNodes).filter(n => n.dataset.sidechainSrc);
      added.forEach(upgrade);
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

// handle events from the inner frame
var onMessage = Sidechain.matchMessage({
  sentinel: "npr-liveblog"
}, function(e) {
  var { unseen } = e;
  var clean = document.title.replace(/^\s*\(\d+\)\s*/, "");
  document.title = unseen ? `(${unseen}) ${clean}` : clean;
});

window.addEventListener("message", onMessage);