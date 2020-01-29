var flags = {
  notifications: false,
  refresh: 10
};

var search = new URL(window.location).searchParams;

var boolean = ["notifications"];
var numeric = ["refresh"];
var text = [];

boolean.forEach(function(key) {
  if (search.get(key)) flags[key] = true;
});

numeric.forEach(function(key) {
  var v = search.get(key);
  if (v) flags[key] = v * 1;
});

text.forEach(function(key) {
  var v = search.get(key);
  if (v) flags[key] = v;
});

module.exports = flags;