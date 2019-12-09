// load custom element behaviors
require("./tags/twitter-embed");
require("./tags/image-embed");

var $ = require("./lib/qsa");

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

var showUnseenButton = $.one(".show-new");

showUnseenButton.addEventListener("click", function() {
  var hidden = $("article.post.hidden");
  hidden.forEach(el => el.classList.remove("hidden"));
  unseen = 0;
  showUnseenButton.classList.add("hidden");
});

var updateMisc = function(updated) {

};

var updatePosts = function(articles) {
  var ids = new Set();
  var container = $.one("main.liveblog");
  var first = container.querySelector("article.post:not(#featured)");
  for (var to of articles) {
    ids.add(to.id);
    var from = $.one("#" + to.id);
    if (!from) {
      // copy and add the post as a hidden post
      from = to.cloneNode(true);
      from.classList.add("hidden");
      container.insertBefore(from, first);
      first = from;
      unseen++;
      console.log(`Added new post!`);
    } else {
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
    }
  }
  // remove posts that were apparently deleted
  var removed = $("article.post").filter(article => !ids.has(article.id));
  removed.forEach(el => el.parentElement.removeChild(el));
  if (removed.length) console.log(`Removed ${removed.length} posts!`);
};

var updatePage = async function() {
  console.log("Running update...");
  try {
    var updated = await getDocument(window.location.href);
    // get updates in reverse order (so we can add in reverse chron)
    var posts = $("article.post", updated).reverse();
    if (!posts.length) return console.log("Remote document was missing liveblog content.");
    updatePosts(posts);
  } catch (err) {
    console.error(err.message);
  }
  var unseen = $("article.post.hidden").length;
  if (unseen) {
    showUnseenButton.querySelector(".count").innerHTML = unseen;
    showUnseenButton.classList.remove("hidden");
  }
}

setInterval(updatePage, 1000 * 10);