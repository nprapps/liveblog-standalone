var styles = `
button {
  display: block;
  background: transparent;
  border: none;
  font-weight: bold;
  color: black;
  padding: 8px 0;
  cursor: pointer;
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
    this.button.innerHTML = "Show more &raquo;";
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
      this.button.innerHTML = value + " &raquo;";
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