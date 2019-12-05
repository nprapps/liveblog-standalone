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
  var updated = await getDocument("index.html");
  morphdom(document.querySelector(diffSelector), updated.querySelector(diffSelector));
}

setInterval(updatePage, 1000 * 10);