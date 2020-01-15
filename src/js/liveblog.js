// load custom element behaviors
require("./tags/twitter-embed");
require("./tags/image-embed");
require("@nprapps/sidechain");

// load independent modules
require("./clipboard");
var audio = require("./audioplayer");

// load local dependencies
var $ = require("./lib/qsa");
var events = require("./events");
var getDocument = require("./getDocument");
var morphdom = require("morphdom");
var notifications = require("./notification");

var h1 = $.one("h1");
var showUnseenButton = $.one(".show-new");

var onClickUnseen = function() {
  var hidden = $("article.post.hidden");
  hidden.forEach(el => el.classList.remove("hidden"));
  showUnseenButton.classList.add("hidden");
  events.send("unseen-posts", 0);
};

showUnseenButton.addEventListener("click", onClickUnseen);

var updateMisc = function(updated) {
  // update audio player state
  var audioUpdate = updated.querySelector("audio.stream-source");
  if (audioUpdate) {
    var text = audioUpdate.innerHTML.trim();
    var source = audioUpdate.getAttribute("src");
    audio.update(source, text);
  } else {
    audio.disable();
  }

  // set title tag
  var title = updated.querySelector("title").innerHTML;
  document.title = title;
  // update headline
  var headline = updated.querySelector("h1").innerHTML;
  h1.innerHTML = headline.trim();
  // set "last updated" text?
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
      var skipCustom = el => el.tagName.indexOf("-") == -1;

      morphdom(from, to, {
        childrenOnly: true,
        // do not update the contents of custom elements
        // this lets us prevent re-init for tweets, lazy images, videos, etc.
        // onBeforeElUpdated: skipCustom,
        onBeforeElChildrenUpdated: skipCustom

      });
      // update posts on the preview page
      if (to.classList.contains("published")) {
        from.classList.remove("draft");
        from.classList.add("published");
      }
    }
  }
  // remove posts that were apparently deleted
  var removed = $("article.post").filter(article => !ids.has(article.id));
  removed.forEach(el => el.parentElement.removeChild(el));
  if (removed.length) console.log(`Removed ${removed.length} posts!`);
};

var refresh = async function() {
  events.send("updating");
  try {
    var updated = await getDocument(window.location.href);
    // get updates in reverse order (so we can add in reverse chron)
    var posts = $("article.post", updated).reverse();
    if (!posts.length) return console.log("Remote document was missing liveblog content.");
    updatePosts(posts);
    updateMisc(updated);
  } catch (err) {
    console.error(err);
  }
  events.send("updated-liveblog");
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
  events.send("unseen-posts", unseen || 0);
}

setInterval(refresh, 1000 * 10);