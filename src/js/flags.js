var flags = {
  notifications: false
};

var search = new URL(window.location).searchParams;

var boolean = ["notifications"];
var value = ["refresh"];

boolean.forEach(function(key) {
  if (search.get(key)) flags[key] = true;
});

value.forEach(function(key) {
  var v = search.get(key);
  if (v) flags[key] = v;
});

module.exports = flags;