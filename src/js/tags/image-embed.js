var stylesheet = `
img {
  max-width: 100%;
  width: 100%;
  height: auto;
  position: relative;
  display: block;
}

img:after {
  content: "loading...";
  background: #DDD;
  color: #333;
  padding: 25% 0;
  text-align: center;
  display: block;
  z-index: 999;
  position: relative;
}
`;

class ImageEmbed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.innerHTML = stylesheet;
    this.shadowRoot.appendChild(style);
    this.image = document.createElement("img");
    this.image.setAttribute("alt", "");
    this.image.src = "broken";
    this.shadowRoot.appendChild(this.image);
    this.updateImage();
    this.readyState = 0;
    this.observer = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      this.readyState = 4;
      this.updateImage();
    });
  }

  connectedCallback() {
    this.updateImage();
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer.disconnect(this);
  }

  static get observedAttributes() {
    return ["src"]
  }

  attributeChangedCallback() {
    this.updateImage();
  }

  updateImage() {
    if (this.readyState == 4) {
      this.image.src = this.getAttribute("src");
      this.observer.disconnect();
    }
  }
}

window.customElements.define("image-embed", ImageEmbed);