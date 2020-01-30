var track = require("./lib/tracking").trackApps;

var input = document.createElement("input");
input.style.position = "absolute";
input.style.left = "-1000px";
input.setAttribute("tabindex", "-1");
input.setAttribute("hidden", "");
document.body.appendChild(input);

var noop = function() {};

var copy = function(text, callback = noop) {
  if (window.navigator.clipboard) {
    window.navigator.clipboard.writeText(text).then(
      () => callback(true),
      () => callback(false)
    );
  } else {
    var currentFocus = document.activeElement;
    input.value = text;
    input.focus();
    input.select();
    var result = document.execCommand("copy");
    setTimeout(() => callback(result), 10);
  }
  track("copied-text", text);
};

module.exports = copy;

// listen for copy links
document.querySelector("main.liveblog").addEventListener("click", function(e) {
  if (e.button) return;
  var target = e.target;
  target.classList.remove("copied", "error");
  if (target.dataset.copy) {
    copy(target.dataset.copy, function(success) {
      target.classList.add(success ? "copied" : "error");
    });
    e.preventDefault();
    e.stopImmediatePropagation();
  }
});

