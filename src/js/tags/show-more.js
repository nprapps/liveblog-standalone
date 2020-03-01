var styles = `
button {
  display: block;
  background: transparent;
  border: none;
  cursor: pointer;
  font: normal 16px 'Knockout 31 4r','Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
  color: #4774CC;
  text-transform: uppercase;
  line-height: 44px;
  padding: 0 0 6px 0;
}
button:hover,
button:active,
button:focus {
  color: #bccae5;
}
`

class ShowMore extends HTMLElement {

  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    var stylesheet = document.createElement("style");
    stylesheet.innerHTML = styles;
    this.shadowRoot.appendChild(stylesheet);

    this.button = document.createElement("button");
    this.button.innerHTML = "Continue Reading This Post ▼";
    this.shadowRoot.appendChild(this.button);

    this.onClick = this.onClick.bind(this);
    this.button.addEventListener("click", this.onClick);
    this.clicked = false;
  }

  static get observedAttributes() {
    return ["text"]
  }

  connectedCallback() {
    if (this.clicked) return;
    var post = this.closest(".post");
    if (!post) return;
    post.classList.add("collapsed");
  }

  attributeChangedCallback(attr, was, value) {
    if (value.trim()) {
      this.button.innerHTML = value + " ▼";
    }
  }

  onClick() {
    var post = this.closest(".post");
    if (!post) return;
    post.classList.remove("collapsed");
    this.clicked = true;
  }

}

window.customElements.define("show-more", ShowMore);
