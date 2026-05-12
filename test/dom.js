const DOM = () => {
  class TextNode {
    text = "";
    constructor(text) {
      this.text = text;
      this.textContent = text;
    }

    getTextContent() {
      return this.text;
    }
  }

  class Event {
    name = "";
    callback = () => {};
    node = null;
    constructor(props) {
      this.name = props.name;
      this.callback = props.callback;
      this.node = props.node;
    }
  }

  class Node {
    tagName = "";
    childNodes = [];
    children = null;
    events = [];
    textContent = "";
    firstChild = null;
    attributes = {};
    innerHTML = "";
    namespaceURI = "";
    className = "";
    constructor(name, ns = "") {
      this.namespaceURI = ns;
      this.tagName = name.toUpperCase();
      this.children = this.childNodes;
    }
    appendChild(child) {
      this.childNodes.push(child);
      this.firstChild = this.childNodes[0];
      this.textContent = this.getTextContent();
    }
    insertBefore(newNode, referenceNode) {
      const n = this.childNodes.find((c) => c === referenceNode);
      if (!n) {
        this.appendChild(newNode);
        return;
      }
      const index = this.childNodes.indexOf(referenceNode);
      this.childNodes.splice(index, 0, newNode);
      this.firstChild = this.childNodes[0];
      this.textContent = this.getTextContent();
    }
    replaceChild(newChild, oldChild) {
      const index = this.childNodes.indexOf(oldChild);

      if (index !== -1) {
        this.childNodes.splice(index, 1, newChild);
        this.firstChild = this.childNodes[0];
        this.textContent = this.getTextContent();
      }
      oldChild = newChild;
    }
    setAttribute(prop, value) {
      this.attributes[prop] = value;
      if (prop === "class") {
        this.className = value;
      }
    }
    getAttribute(prop) {
      return this.attributes[prop];
    }

    getTextContent() {
      let result = "";
      for (let child of this.childNodes) {
        if (child instanceof TextNode) {
          result += child.text;
        } else if (child instanceof Node) {
          result += child.getTextContent();
        }
      }
      return result;
    }

    dispatchEvent(event) {
      this.events
        .filter((e) => e.name === event.type)
        .map((e) => {
          e.callback({ target: e.node });
        });
    }

    addEventListener(name, callback, bubble = false) {
      this.events.push(new Event({ node: this, name, callback, bubble }));
    }

    click() {
      this.events
        .filter((e) => e.name === "click")
        .forEach((e) => {
          e.callback({ target: e });
        });
    }
  }

  class Document {
    name = "";
    tagName = "";
    childNodes = [];
    children = null;

    events = [];
    head = null;
    body = null;

    constructor(name) {
      this.name = name;
      this.body = new Node("body");
      this.head = new Node("head");
      this.children = this.childNodes;
    }

    appendChild(child) {
      this.childNodes.push(child);
    }
    createElement(name) {
      return new Node(name);
    }
    createElementNS(ns, name) {
      return new Node(name, ns);
    }
    createTextNode(text) {
      return new TextNode(text);
    }
    dispatchEvent(event) {}
  }

  return {
    document: new Document("document"),
    window: {},
  };
};

export default DOM;
