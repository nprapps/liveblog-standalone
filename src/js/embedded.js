require("./liveblog");
var events = require("./events");

var Sidechain = require("@nprapps/sidechain");

var guest = Sidechain.registerGuest({
  sentinel: "npr-liveblog"
});

events.on("unseen-posts", function(unseen) {
  // update the parent page
  guest.sendMessage({ unseen });
});