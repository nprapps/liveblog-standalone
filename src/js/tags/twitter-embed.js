class TwitterEmbed extends HTMLElement {
  constructor() {
    super();
    // this.attachShadow({ mode: "open" });
    // this.populate();
    this.readyState = 0;
  }

  connectedCallback() {
    if (this.readyState == 4) return;
    this.populate();
    this.readyState = 4;
  }

  attributeChangedCallback() {
    this.populate();
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
