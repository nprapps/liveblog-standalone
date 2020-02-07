// load custom element behaviors
require("./tags/twitter-embed");
require("./tags/image-embed");
require("./tags/youtube-video");
require("@nprapps/sidechain");

// load independent modules
require("./clipboard");
var audio = require("./audioplayer");
var flags = require("./flags");

// load local dependencies
var $ = require("./lib/qsa");
var events = require("./events");
var getDocument = require("./getDocument");
var morphdom = require("morphdom");
var notifications = require("./notification");

var h1 = $.one("header h1");
var h2 = $.one("header h2");
var headerInjection = $.one("header .html-injection");
var embeddedHeaderInjection = $.one("header .embed-html-injection");
var showUnseenButton = $.one(".show-new");

var lastUnseen = 0;
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
  var headline = updated.querySelector("h1");
  if (h1 && headline) h1.innerHTML = headline.innerHTML.trim();
  var subhead = updated.querySelector("h2");
  if (h2 && subhead) h2.innerHTML = subhead.innerHTML.trim();
  // update header HTML chunk
  var morphInjected = { childrenOnly: true };
  var embed = updated.querySelector("header .html-injection");
  if (headerInjection && embed) morphdom(headerInjection, embed, morphInjected);
  var embedSquared = updated.querySelector("header .embed-html-injection");
  if (embeddedHeaderInjection && embedSquared) morphdom(embeddedHeaderInjection, embedSquared, morphInjected);
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
    // updated will be null if the response was a 304
    if (!updated) return;
    // get updates in reverse order (so we can add in reverse chron)
    var posts = $("article.post", updated).reverse();
    if (!posts.length) return console.log("Remote document was missing liveblog content.");
    updatePosts(posts);
    updateMisc(updated);
  } catch (err) {
    console.error(err);
    return;
  }
  events.send("updated-liveblog");
  var unseen = $("article.post.hidden").length;
  if (unseen) {
    showUnseenButton.querySelector(".count").innerHTML = unseen;
    showUnseenButton.dataset.count = unseen;
    showUnseenButton.classList.remove("hidden");
    if (unseen != lastUnseen) {
      var plural = unseen == 1 ? "post" : "posts";
      notifications.alert(`${unseen} new liveblog ${plural}`, function() {
        window.focus();
        onClickUnseen();
        setTimeout(() => $.one("main.liveblog").scrollIntoView({ behavior: "smooth" }), 300);
      });
      lastUnseen = unseen;
    }
  }
  events.send("unseen-posts", unseen || 0);
}

setInterval(refresh, flags.refresh * 1000);