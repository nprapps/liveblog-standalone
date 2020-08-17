var track = require("./lib/tracking").trackApps;

var input = document.createElement("textarea");
input.style.position = "fixed";
input.style.left = "-1000px";
input.style.top = "0";
input.style.fontSize = "20px";
input.setAttribute("tabindex", "-1");
input.setAttribute("hidden", "");
input.contentEditable = true;
input.readOnly = false;
document.body.appendChild(input);

var noop = function() {};

var copy = function(text, callback = noop) {
  if (window.navigator.clipboard) {
    window.navigator.clipboard.writeText(text).then(
      () => callback(true),
      err => { console.log(err); callback(false) }
    );
  } else {
    var currentFocus = document.activeElement;
    var range = document.createRange();
    input.removeAttribute("hidden");
    input.value = text;
    input.focus();
    input.select();
    range.selectNodeContents(input);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    input.setSelectionRange(0, text.length);
    var result = document.execCommand("copy");
    setTimeout(() => callback(result), 10);
    input.setAttribute("hidden", "");
    currentFocus.focus();
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
    e.preventDefault();
    e.stopImmediatePropagation();
    copy(target.dataset.copy, function(success) {
      target.classList.add(success ? "copied" : "error");
    });
  }
});

