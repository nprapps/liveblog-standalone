// load custom element behaviors
require("./tags/twitter-embed");
require("./tags/image-embed");

var diffSelector = "main.liveblog";
var morphdom = require("morphdom");

var getDocument = function(url) {
  return new Promise(function(ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
    xhr.onload = () => ok(xhr.response);
    xhr.onerror = fail;
  });
}

var updatePage = async function() {
  console.log("Running update...");
  try {
    var updated = await getDocument(window.location.href);
    var from = document.querySelector(diffSelector);
    var to = updated.querySelector(diffSelector);
    if (!to) return console.log("Remote document was missing liveblog content.");
    morphdom(from, to, {
      onBeforeElChildrenUpdated: function(from, to) {
        // do not update the children of custom elements
        // this lets us prevent re-init for tweets, lazy images, videos, etc.
        if (from.tagName.match(/-/)) {
          return false;
        }
        return true;
      }
    });
  } catch (err) {
    console.error(err.message);
  }
}

setInterval(updatePage, 1000 * 3);