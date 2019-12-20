module.exports = function(url) {
  return new Promise(function(ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
    xhr.onload = () => ok(xhr.response);
    xhr.onerror = function(err) {
      var message = xhr.statusText || `Request for ${url} failed without status.`
      fail(message);
    }
  });
};