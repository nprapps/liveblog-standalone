class TwitterEmbed extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ["href"];
  }

  attributeChangedCallback(_, past, value) {
    if (past != value) {
      this.populate(value);
    }
  }

  populate(href) {
    console.log(`Loading tweet: ${href}`);
    this.innerHTML = `
<blockquote class="twitter-tweet">
<a href="${href}">Embedded Tweet</a>
</blockquote>
    `;
    var script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js"
    this.appendChild(script);
  }
}

window.customElements.define("twitter-embed", TwitterEmbed);
