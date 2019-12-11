// load custom element behaviors
require("./tags/twitter-embed");
require("./tags/image-embed");
require("@nprapps/sidechain");

// load independent modules
require("./clipboard");

var $ = require("./lib/qsa");
var notifications = require("./notification");

var morphdom = require("morphdom");

var getDocument = function(url) {
  return new Promise(function(ok, fail) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url);
    xhr.responseType = "document";
    xhr.send();
    xhr.onload = () => ok(xhr.response);
    xhr.onerror = function(err) {
      console.log(err);
      fail();
    }
  });
}

var showUnseenButton = $.one(".show-new");

var onClickUnseen = function() {
  var hidden = $("article.post.hidden");
  hidden.forEach(el => el.classList.remove("hidden"));
  unseen = 0;
  showUnseenButton.classList.add("hidden");
};

showUnseenButton.addEventListener("click", onClickUnseen);

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
      console.log(`Added new post!`);
    } else {
      morphdom(from, to, {
        childrenOnly: true,
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
    console.error(err);
  }
  var unseen = $("article.post.hidden").length;
  if (unseen) {
    showUnseenButton.querySelector(".count").innerHTML = unseen;
    showUnseenButton.classList.remove("hidden");
    notifications.alert(`${unseen} new liveblog posts`, function() {
      window.focus();
      onClickUnseen();
      setTimeout(() => $.one("main.liveblog").scrollIntoView({ behavior: "smooth" }), 300);
    });
  }
}

setInterval(updatePage, 1000 * 10);