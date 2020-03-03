const READY = 4;
const NOT_READY = 0;

class TwitterEmbed extends HTMLElement {
  constructor() {
    super();
    this.readyState = NOT_READY;
    var callback = ([e]) => {
      if (!e.isIntersecting) return;
      this.readyState = READY;
      this.populate(this.getAttribute("href"));
      observer.disconnect();
    };
    var options = {
      rootMargin: "0px 0px 100px 0px",
      threshold: 0
    };
    var observer = new IntersectionObserver(callback, options);
    observer.observe(this);
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
    if (this.readyState != READY) return;
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
