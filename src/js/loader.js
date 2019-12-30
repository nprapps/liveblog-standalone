// load Sidechain and the legacy browser shim
require("@webcomponents/custom-elements");
var Sidechain = require("@nprapps/sidechain");

// handle events from the inner frame
var onMessage = Sidechain.matchMessage({
  sentinel: "npr-liveblog"
}, function(e) {
  var { unseen } = e;
  var clean = document.title.replace(/^\s*\(\d+\)\s*/, "");
  document.title = unseen ? `(${unseen}) ${clean}` : clean;
});

window.addEventListener("message", onMessage);