var $ = require("./lib/qsa");
var adElement = $.one("#ad-centerstage-wrap");

var observer = new IntersectionObserver(function([event]) {
  if (event.isIntersecting) {
    observer.disconnect();
    var gpt = document.createElement("script");
    gpt.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
    document.body.appendChild(gpt);
    console.log("Lazy-loading ad code...");
  }
});

observer.observe(adElement);

window.googletag = window.googletag || {cmd: []};
googletag.cmd.push(function() {
  var adSizeArray = ["fluid", [1300, 250]];
  var adUnitString = "/6735/n6735.npr/news_politics_elections";
  // Medium and small breakpoints
  if (window.innerWidth < 1024) {
    adUnitString = "/6735/n6735.nprmobile/news_politics_elections";
    adSizeArray.push([300, 250]);
  }
  var advelvetTargeting = [String(Math.floor(Math.random() * 20) + 1)];
  var slug = window.location.pathname.replace(/[^\/]+\.html$/, "").split("/").pop();
  var storyId = "liveblog-" + (slug || "localhost");
  var isStagingServer = true || window.location.hostname == "stage-apps.npr.org";

  googletag.defineSlot(adUnitString, adSizeArray, "ad-centerstage-wrap").addService(googletag.pubads());
  googletag.pubads().enableSingleRequest();
  googletag.pubads().collapseEmptyDivs();
  googletag.pubads().setTargeting("advelvet", advelvetTargeting);
  googletag.pubads().setTargeting("storyid", [storyId]);
  googletag.pubads().setTargeting("testserver", [isStagingServer.toString()]);
  googletag.pubads().addEventListener("slotRenderEnded", function(event) {
    adElement.classList.remove("pending");
    if (!event.isEmpty) {
      adElement.classList.add("has-ad");
    } else {
      console.log("No ad returned");
    }
  });
  googletag.enableServices();
  googletag.display("ad-centerstage-wrap");
});