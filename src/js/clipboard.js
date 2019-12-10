var input = document.createElement("input");
input.style.position = "absolute";
input.style.left = "-1000px";
document.body.appendChild(input);

var copy = function(text) {
  if (window.navigator.clipboard) {
    window.navigator.clipboard.writeText(text);
  } else {
    var currentFocus = document.activeElement;
    input.value = text;
    input.focus();
    input.select();
    document.execCommand("copy");
  }
};

module.exports = copy;

// listen for copy links
document.querySelector("main.liveblog").addEventListener("click", function(e) {
  if (e.button) return;
  var target = e.target;
  if (target.dataset.copy) {
    copy(target.dataset.copy);
    target.classList.add("copied");
    e.preventDefault();
  }
});

