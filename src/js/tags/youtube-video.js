/*
<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/mfhBM_Yay6w"
  frameborder="0"
  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
*/

const READY = 4;
const NOT_READY = 0;

var stylesheet = `
.container {
  position: relative;
}

iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
`

class YouTube extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.style.display = "block";

    var container = document.createElement("div");
    container.className = "container";
    this.shadowRoot.appendChild(container);

    this.iframe = document.createElement("iframe");
    container.appendChild(this.iframe);
    this.iframe.setAttribute("allowfullscreen", "");
    this.iframe.setAttribute("frameborder", "0");
    this.iframe.setAttribute("allow", "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture");

    this.spacer = document.createElement("div");
    this.spacer.style.paddingBottom = "56.25%";
    container.appendChild(this.spacer);

    var style = document.createElement("style");
    style.innerHTML = stylesheet;
    this.shadowRoot.appendChild(style);
    this.style.position = "relative";
    this.readyState = NOT_READY;

    var observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      this.readyState = READY;
      observer.disconnect();
      console.log(this);
      this.attributeChangedCallback("video", null, this.getAttribute("video"));
    });
    observer.observe(this);
  }

  static get observedAttributes() {
    return ["video"];
  }

  attributeChangedCallback(attr, was, value) {
    switch (attr) {
      case "video":
        if (this.readyState != READY) return;
        this.iframe.src = `https://www.youtube.com/embed/${value}`;
        break;

      case "aspect":
        var [w, h] = value.split("x");
        if (!w || !h) return;
        this.spacer.style.paddingBottom = (h / w).toFixed(2) + "%";
    }
  }

  connectedCallback() {
    if (this.readyState != READY) return;
    var video = this.getAttribute("video");
    var src = `https://www.youtube.com/embed/${video}`;
    if (this.iframe.src != src) this.iframe.src = src;
  }

  disconnectedCallback() {
    this.iframe.src = "";
  }

}

window.customElements.define("youtube-video", YouTube);