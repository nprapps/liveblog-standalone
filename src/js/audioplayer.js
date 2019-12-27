var $ = require("./lib/qsa");
var track = require("./lib/tracking");

var playerURL = "https://cdn.jwplayer.com/libraries/JNfsuMc9.js";
var ui = $.one(".audio-player");
var playButton = ui.querySelector("button.play-stream");
var playlist = ui.querySelector("span.text");

var playTotal = 0;

var loadPlayer = null;
var getPlayer = function(src) {
  if (!loadPlayer) {
    loadPlayer = new Promise(function(ok, fail) {
      var script = document.createElement("script");
      script.src = playerURL;
      document.body.appendChild(script);
      script.onload = function() {
        // create a hidden player element
        var div = document.createElement("div");
        div.style.visibility = "hidden";
        div.style.position = "absolute";
        div.style.left = "-1000px";
        div.setAttribute("aria-hidden", "true");
        div.id = "jwplayer";
        document.body.appendChild(div);

        // instantiate player
        var player = jwplayer("jwplayer")
        player.setup({
          file: src
        });

        playButton.addEventListener("click", function() {
          // play/pause the live stream
          if (player.getState() == "playing") {
            player.pause();
            track("liveblog-stream-state", "pause");
            playTotal = 0; // timestamps will reset on each new stream play
          } else {
            player.setVolume(100);
            player.play();
            track("liveblog-stream-state", "play");
          }
        });

        var pressed = function(e) {
          playButton.classList.remove("seeking");
          playButton.setAttribute("aria-pressed", "true");
        };

        var unpressed = function(e) {
          playButton.classList.remove("seeking");
          playButton.setAttribute("aria-pressed", "false");
        };

        var seeking = function() {
          playButton.classList.add("seeking");
        }

        // register for events
        player.on("ready", function() {
          player.on("play", pressed);
          player.on("pause", unpressed);
          player.on("buffer", seeking);
          player.on("seek", seeking);
        });

        player.on("time", function(e) {
          var time = Math.floor(e.position / 30) * 30;
          if (time > playTotal) {
            playTotal = time;
            track("liveblog-stream-duration", time + "s");
          }
        });

        player.setMute(true);

        window.player = player;

        ok(player)
      };
    });
  }
  return loadPlayer;
};

var killPlayer = function() {
  if (loadPlayer) {
    getPlayer().then(player => player.pause());
  }
}

var lastSrc = null;
var update = function(src, text) {
  ui.classList.remove("hidden");
  ui.classList.toggle("no-audio", !src);
  if (src && lastSrc != src) {
    lastSrc = src;
    playlist.innerHTML = "Loading player...";
    getPlayer(src).then(function(player) {
      playlist.innerHTML = text;
      // set JWPlayer playlist
      player.load([{
        file: src
      }]);
    });
  } else {
    // distinguish between "no source" and "same as last"
    if (!src) {
      killPlayer();
    }
    playlist.innerHTML = text;
  }
};

var disable = function() {
  ui.classList.add("hidden");
  killPlayer();
};

module.exports = { update, disable }