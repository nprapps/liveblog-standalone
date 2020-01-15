class TwitterEmbed extends HTMLElement {
  constructor() {
    super();
    // this.attachShadow({ mode: "open" });
    // this.populate();
    this.readyState = 0;
    this.href = null;
  }

  connectedCallback() {
    if (this.readyState == 4) return;
    this.populate();
    this.readyState = 4;
  }

  static get observedAttributes() {
    return ["href"];
  }

  attributeChangedCallback(_, past, value) {
    if (this.href != value) {
      this.populate();
      this.href = value;
    }
  }

  populate() {
    console.log(`Loading tweet: ${this.getAttribute("href")}`);
    this.innerHTML = `
<blockquote class="twitter-tweet">
<a href="${this.getAttribute("href")}">Embedded Tweet</a>
</blockquote>
    `;
    var script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js"
    this.appendChild(script);
  }
}

window.customElements.define("twitter-embed", TwitterEmbed);
