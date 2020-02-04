var $ = require("./lib/qsa");
var { track } = require("./lib/tracking");

var playerURL = "https://cdn.jwplayer.com/libraries/JNfsuMc9.js";
var ui = $.one(".audio-player");
var playButton = ui.querySelector("button.play-stream");
var playlist = ui.querySelector("span.text");

var dimensions = {
  streamStarts: "metric2",
  totalListenerSeconds: "metric4"
};

var createDimensions = function(original) {
  var output = {
    dimension35: "from page"
  };
  for (var k in original) {
    if (k in dimensions) {
      output[dimensions[k]] = original[k];
    } else {
      output[k] = original[k];
    }
  }
  console.log(output);
  return output;
};

// tracking code
var resumeTime = 0;
var thresholds = [15, 30, 60, 120, 180, 240, 300];
var elapsed = thresholds.map((t, i, a) => t - (a[i - 1] || 0));
var hasPlayed = false;
var trackingLabel = "liveblog-stream";
var isPlaying = false;

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

        ui.addEventListener("click", function() {
          // play/pause the live stream
          if (player.getState() == "playing") {
            resumeTime += player.getPosition();
            isPlaying = false;
            player.pause();
            track("audio actions", "pause audio", trackingLabel);
          } else {
            player.setVolume(100);
            isPlaying = true;
            player.play();
            var action = hasPlayed ? "resume audio" : "initiate audio";
            var dims = hasPlayed ? {} : createDimensions({ streamStarts: 1 });
            track("audio actions", action, trackingLabel, undefined, dims);
            hasPlayed = true;
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
          if (!isPlaying) return;
          var position = player.getPosition();
          var time = resumeTime + position;
          var [ threshold ] = thresholds;
          if (time > threshold) {
            // move to the next time period
            thresholds.shift();
            var tls = elapsed.shift() || 300;
            // past the 5 minute threshold, add another 5
            if (!thresholds.length) {
              thresholds.unshift(threshold + 300);
            }
            // send the event
            var action = threshold >= 60 ? `${threshold / 60} min ping` : `${threshold} sec ping`;
            var dims = createDimensions({ totalListenerSeconds: tls });
            track("audio pings", action, trackingLabel, undefined, dims);
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
  if (!text) return;
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

// autoload if stream is provided in the template
if (ui.dataset.stream) {
  var presetText = playlist.innerHTML;
  update(ui.dataset.stream, presetText);
}

module.exports = { update, disable }