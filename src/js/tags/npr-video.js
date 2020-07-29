/*
<div style="position:relative; overflow:hidden; padding-bottom:56.25%">
<iframe 
  src="https://cdn.jwplayer.com/players/4a8cwpbr-HWSueGzu.html"
  width="100%" height="100%" frameborder="0" scrolling="auto"
  title="President Trump holds a news conference"
  style="position:absolute;" allowfullscreen></iframe>
</div>
*/

var css = `
:host {
  display: block;
}

.aspect-ratio {
  position: relative;
}

.aspect-ratio::before {
  display: block;
  content: "";
  padding-bottom: 56.25%;
}

iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
`

class NPRVideo extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    var style = document.createElement("style");
    style.innerHTML = css;
    this.shadowRoot.appendChild(style);

    var aspect = document.createElement("div");
    aspect.className = "aspect-ratio";
    this.shadowRoot.appendChild(aspect);

    var iframe = this.iframe = document.createElement("iframe");
    iframe.setAttribute("scrolling", "auto");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "");
    aspect.appendChild(iframe);
  }

  attributeChangedCallback(attr, was, value) {
    var url = `https://cdn.jwplayer.com/players/${value}-HWSueGzu.html`;
    this.iframe.setAttribute("src", url);
  }

  static get observedAttributes() {
    return ["media"];
  }
}

window.customElements.define("npr-video", NPRVideo);