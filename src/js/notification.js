var $ = require("./lib/qsa");

var enabled = window.Notification && window.Notification.permission == "granted";
if (enabled) document.body.classList.add("enabled-notifications");

if (window.Notification) {
  document.body.classList.add("supports-notifications");
}

var request = async function() {
  if (!window.Notification || Notification.permission == "denied") return;
  var permission = await Notification.requestPermission();
  if (permission == "granted") {
    enabled = true;
    document.body.classList.add("enabled-notifications");
  }
};

var alert = async function(text) {
  if (!window.Notification || !enabled) return console.log("Notifications not enabled");
  console.log(`Notification: ${text}`);
  var notification = new Notification(text, {
    tag: "NPR Liveblog",
    badge: "./assets/logo_lines.png",
    icon: "./assets/logo_lines.png",
    requireInteraction: true
  });
};


var checkbox = $.one("#enable-notifications");
checkbox.checked = enabled;
checkbox.addEventListener("change", async function() {
  var value = this.checked;
  if (!value) {
    enabled = false;
  } else {
    if (Notification.permission == "granted") {
      enabled = true;
    } else {
      await request();
      this.checked = enabled;
    }
    if (enabled) alert("Notifications are enabled!");
  }
});

module.exports = { request, alert };