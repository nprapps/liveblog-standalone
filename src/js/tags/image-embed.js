var stylesheet = `
img {
  max-width: 100%;
  height: auto;
  position: relative;
  display: block;
}

.placeholder {
  background: #DDD;
  color: #333;
  padding: 25% 0;
  text-align: center;
}

.credit {
  display: block;
  text-align: right;
  font-size: 12px;
  font-style: italic;
  color: #787878;
  font-family: 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
}

:host([narrow]) img {
  max-width: 400px;
  width: 100%;
}
`;

var NOT_READY = 0;
var READY = 4;

class ImageEmbed extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    var style = document.createElement("style");
    style.innerHTML = stylesheet;
    this.shadowRoot.appendChild(style);

    this.link = document.createElement("a");
    this.shadowRoot.appendChild(this.link);

    this.image = document.createElement("img");
    this.image.setAttribute("alt", "");
    this.image.src = "";
    this.link.appendChild(this.image);

    this.placeholder = document.createElement("div");
    this.placeholder.className = "placeholder";
    this.placeholder.innerHTML = "loading...";
    this.shadowRoot.appendChild(this.placeholder);
    
    this.credit = document.createElement("div");
    this.credit.className = "credit";
    this.shadowRoot.appendChild(this.credit);
    
    this.updateImage();
    this.readyState = NOT_READY;
    var callback = ([e]) => {
      if (!e.isIntersecting) return;
      this.readyState = READY;
      this.updateImage();
    };
    var options = {
      threshold: 0,
      rootMargin: "0px 0px 100px 0px"
    };
    this.observer = new IntersectionObserver(callback, options);

    this.image.onload = () => this.placeholder.style.display = "none";
  }

  connectedCallback() {
    this.updateImage();
    this.observer.observe(this);
  }

  disconnectedCallback() {
    this.observer.disconnect(this);
  }

  static get observedAttributes() {
    return ["src", "credit", "href"]
  }

  attributeChangedCallback(attr, pastValue, value) {
    this.updateImage();
  }

  updateImage() {
    this.credit.innerHTML = this.getAttribute("credit");
    if (this.hasAttribute("href")) {
      this.link.href = this.getAttribute("href");
    } else {
      this.link.removeAttribute("href")
    }
    if (this.readyState == READY) {
      this.image.src = this.getAttribute("src");
      this.observer.disconnect();
    }
  }
}

try {
  window.customElements.define("image-embed", ImageEmbed);
} catch (err) {
  console.log(`Unable to define image-embed tag: your browser may not support custom elements`);
}