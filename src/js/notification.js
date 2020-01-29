var $ = require("./lib/qsa");
var track = require("./lib/tracking").trackApps;

var flags = require("./flags");

var enabled =
  flags.notifications &&
  window.Notification &&
  window.Notification.permission == "granted" &&
  localStorage.enableNotifications;

var setEnabled = function(state) {
  track("notifications-enabled", state);
  enabled = localStorage.enableNotifications = Number(state);
  document.body.classList.toggle("enabled-notifications", state);
};

if (flags.notifications) setEnabled(enabled);

if (flags.notifications && window.Notification) {
  document.body.classList.add("supports-notifications");
}

var request = async function() {
  if (!window.Notification || Notification.permission == "denied") return;
  var permission = await Notification.requestPermission();
  if (permission == "granted") {
    setEnabled(true);
  }
};

var alert = async function(text, callback) {
  if (!window.Notification || !enabled)
    return console.log("Notifications not enabled");
  console.log(`Notification: ${text}`);
  var notification = new Notification(text, {
    tag: "NPR Liveblog",
    badge: "./assets/logo_lines.png",
    icon: "./assets/logo_lines.png"
    // requireInteraction: true
  });
  if (callback)
    notification.onclick = function(e) {
      notification.close();
      callback(e);
    };
};

var checkbox = $.one("#enable-notifications");
if (checkbox) {
  checkbox.checked = enabled;
  checkbox.addEventListener("change", async function() {
    var value = this.checked;
    if (!value) {
      setEnabled(false);
    } else {
      if (Notification.permission == "granted") {
        setEnabled(true);
      } else {
        await request();
        this.checked = enabled;
      }
      if (enabled) alert("Notifications are enabled!");
    }
  });
}

module.exports = { request, alert };
