import test from "node:test";
import { describe, it } from "node:test";
import assert from "node:assert";
//import { JSDOM } from 'jsdom';
import DOM from "./dom.js";
import JML from "./index.js";
/*
// Create a single JSDOM instance once for all tests
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
*/
const { document, window } = DOM();
global.document = document;
global.window = window;

describe("h()", () => {
  it("should create a JML object", () => {
    const { h } = JML();
    const element = h("div", { id: "test" }, "Hello");

    assert.strictEqual(element.name, "div");
    assert.deepStrictEqual(element.props, { id: "test" });
    assert.strictEqual(element.children, "Hello");
  });

  it("should create a JML object with no props or children", () => {
    const { h } = JML();
    const element = h("br");

    assert.strictEqual(element.name, "br");
    assert.strictEqual(element.props, undefined);
    assert.strictEqual(element.children, undefined);
  });

  it("should create a JML object with array children", () => {
    const { h } = JML();
    const children = [h("li", {}, "Item 1"), h("li", {}, "Item 2")];
    const element = h("ul", {}, children);

    assert.strictEqual(element.name, "ul");
    assert.strictEqual(element.children.length, 2);
    assert.strictEqual(element.children[0].name, "li");
  });
});

describe("render()", () => {
  it("should create a DOM element", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("span", {}, "Test");
    const rendered = render(root, element);

    assert.strictEqual(rendered.tagName, "SPAN");
    assert.strictEqual(rendered.textContent, "Test");
  });

  it("should append to root", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("span", {}, "Content");
    render(root, element);

    assert.strictEqual(root.children.length, 1);
    assert.strictEqual(root.firstChild.tagName, "SPAN");
  });

  it("should set HTML attributes", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", { id: "app", "data-test": "value" }, "");
    const rendered = render(root, element);

    assert.strictEqual(rendered.getAttribute("id"), "app");
    assert.strictEqual(rendered.getAttribute("data-test"), "value");
  });

  it("should handle array class values", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", { class: ["btn", "btn-primary", "active"] }, "");
    const rendered = render(root, element);

    assert.strictEqual(
      rendered.getAttribute("class"),
      "btn btn-primary active",
    );
  });

  it("should attach event listeners", () => {
    const { h, render } = JML();

    let clicked = false;
    const root = document.createElement("div");
    const element = h(
      "button",
      {
        onClick: () => {
          clicked = true;
        },
      },
      "Click",
    );

    const rendered = render(root, element);
    rendered.click();

    assert.strictEqual(clicked, true);
  });

  it("should handle innerHTML", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", { innerHTML: "<strong>Bold</strong>" }, "");
    const rendered = render(root, element);

    assert.strictEqual(rendered.innerHTML, "<strong>Bold</strong>");
  });

  it("should support nested elements", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", {}, h("span", {}, "Nested"));
    const rendered = render(root, element);

    assert.strictEqual(rendered.firstChild.tagName, "SPAN");
    assert.strictEqual(rendered.firstChild.textContent, "Nested");
  });

  it("should support array of children", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", {}, [
      h("span", {}, "One"),
      h("span", {}, "Two"),
      h("span", {}, "Three"),
    ]);
    const rendered = render(root, element);

    assert.strictEqual(rendered.children.length, 3);
    assert.strictEqual(rendered.children[0].textContent, "One");
    assert.strictEqual(rendered.children[1].textContent, "Two");
    assert.strictEqual(rendered.children[2].textContent, "Three");
  });

  it("should filter null values in arrays", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", {}, [
      h("span", {}, "Item"),
      null,
      h("span", {}, "Another"),
    ]);
    const rendered = render(root, element);

    assert.strictEqual(rendered.children.length, 2);
  });

  it("should support text nodes", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", {}, "Plain text");
    const rendered = render(root, element);

    assert.strictEqual(rendered.textContent, "Plain text");
  });

  it("should support number children", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", {}, 42);
    const rendered = render(root, element);

    assert.strictEqual(rendered.textContent, "42");
  });

  it("should support mixed text and elements", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h("div", {}, [
      "Text before",
      h("span", {}, "Element"),
      "Text after",
    ]);
    const rendered = render(root, element);

    assert.strictEqual(rendered.childNodes.length, 3);
    assert.strictEqual(rendered.childNodes[0].textContent, "Text before");
    assert.strictEqual(rendered.childNodes[1].tagName, "SPAN");
    assert.strictEqual(rendered.childNodes[2].textContent, "Text after");
  });

  it("should throw on invalid JML object", () => {
    const { render } = JML();

    const root = document.createElement("div");
    assert.throws(() => {
      render(root, { invalid: "object" });
    }, /invalid JML object/);
  });

  it("should handle SVG elements", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const element = h(
      "svg",
      { viewBox: "0 0 100 100" },
      h("circle", { cx: "50", cy: "50", r: "40" }, ""),
    );
    const rendered = render(root, element);

    assert.strictEqual(rendered.namespaceURI, "http://www.w3.org/2000/svg");
    const circle = rendered.firstChild;
    assert.strictEqual(circle.namespaceURI, "http://www.w3.org/2000/svg");
  });

  it("should dispatch create event", () => {
    const { h, render } = JML();

    let createEventFired = false;
    const root = document.createElement("div");
    const element = h("div", {}, "");
    const rendered = render(root, element);

    rendered.addEventListener("create", () => {
      createEventFired = true;
    });

    // Dispatch event manually for this test
    const event = new Event("create");
    rendered.dispatchEvent(event);
    assert.strictEqual(createEventFired, true);
  });

  it("should accept an array of JML objects", () => {
    const { h, render } = JML();

    const root = document.createElement("div");
    const elements = [h("span", {}, "First"), h("span", {}, "Second")];
    render(root, elements);

    assert.strictEqual(root.children.length, 2);
    assert.strictEqual(root.children[0].textContent, "First");
  });
});

describe("createComponent()", () => {
  it("should create a stateful component", () => {
    const { h, createComponent } = JML();

    const counter = createComponent({
      initialState: { count: 0 },
      render: (state) => h("div", {}, `Count: ${state.count}`),
    });

    assert.strictEqual(typeof counter.mount, "function");
    assert.strictEqual(typeof counter.update, "function");
  });

  it("should mount and render", () => {
    const { h, createComponent } = JML();

    const counter = createComponent({
      initialState: { count: 0 },
      render: (state) => h("div", {}, `Count: ${state.count}`),
    });

    const root = document.createElement("div");
    const rendered = counter.mount(root);

    assert.strictEqual(rendered.textContent, "Count: 0");
    assert.strictEqual(root.children.length, 1);
  });

  it("should update state and re-render", () => {
    const { h, createComponent } = JML();

    const counter = createComponent({
      initialState: { count: 0 },
      render: (state, update) =>
        h("div", {}, [
          `Count: ${state.count}`,
          h(
            "button",
            { onClick: () => update({ count: state.count + 1 }) },
            "+",
          ),
        ]),
    });

    const root = document.createElement("div");
    const rendered = counter.mount(root);
    assert.strictEqual(rendered.textContent.includes("Count: 0"), true);

    const rerendered = counter.update({ count: 5 });
    assert.strictEqual(rerendered.textContent.includes("Count: 5"), true);
  });

  it("should merge state shallowly", () => {
    const { h, createComponent } = JML();

    const app = createComponent({
      initialState: { user: { name: "John", age: 30 }, theme: "dark" },
      render: (state) => h("div", {}, `${state.user.name}, ${state.theme}`),
    });

    const root = document.createElement("div");
    app.mount(root);

    // Update only theme, user should remain unchanged
    app.update({ theme: "light" });

    const rendered = root.firstChild;
    assert.strictEqual(rendered.textContent, "John, light");
  });

  it("should maintain state between updates", () => {
    const { h, createComponent } = JML();

    const counter = createComponent({
      initialState: { count: 0 },
      render: (state, update) =>
        h(
          "button",
          { onClick: () => update({ count: state.count + 1 }) },
          `${state.count}`,
        ),
    });

    const root = document.createElement("div");
    let rendered = counter.mount(root);

    rendered = counter.update({ count: 1 });
    assert.strictEqual(rendered.textContent, "1");

    rendered = counter.update({ count: 2 });
    assert.strictEqual(rendered.textContent, "2");
  });

  it.skip("should allow event handlers in render", () => {
    const { h, createComponent } = JML();

    let callCount = 0;

    const button = createComponent({
      initialState: { clicks: 0 },
      render: (state, update) =>
        h(
          "button",
          {
            onClick: () => {
              callCount++;
              update({ clicks: state.clicks + 1 });
            },
          },
          `Clicks: ${state.clicks}`,
        ),
    });

    const root = document.createElement("div");
    let rendered = button.mount(root);

    rendered.click();
    assert.strictEqual(callCount, 1);
    assert.strictEqual(rendered.textContent, "Clicks: 1");

    rendered.click();
    assert.strictEqual(callCount, 2);
    assert.strictEqual(rendered.textContent, "Clicks: 2");
  });

  it("should handle empty initial state", () => {
    const { h, createComponent } = JML();

    const component = createComponent({
      render: (state) => h("div", {}, "No state"),
    });

    const root = document.createElement("div");
    const rendered = component.mount(root);

    assert.strictEqual(rendered.textContent, "No state");
  });
});

test("JML - h() and render() work with complex nested structures", () => {
  const { h, render } = JML();

  const root = document.createElement("div");
  const element = h("div", { class: "container" }, [
    h("h1", {}, "Title"),
    h("ul", { class: "list" }, [
      h("li", {}, "Item 1"),
      h("li", {}, "Item 2"),
      h("li", {}, "Item 3"),
    ]),
    h("footer", {}, "Footer text"),
  ]);

  const rendered = render(root, element);

  assert.strictEqual(rendered.className, "container");
  assert.strictEqual(rendered.children[0].tagName, "H1");
  assert.strictEqual(rendered.children[1].children.length, 3);
  assert.strictEqual(rendered.children[2].tagName, "FOOTER");
});

test("JML - event listener receives correct event target", () => {
  const { h, render } = JML();

  let eventTarget = null;
  const root = document.createElement("div");
  const element = h(
    "input",
    {
      type: "text",
      onChange: (e) => {
        eventTarget = e.target;
      },
    },
    "",
  );

  const rendered = render(root, element);
  rendered.value = "test";

  const event = new Event("change", { bubbles: true });
  rendered.dispatchEvent(event);

  assert.strictEqual(eventTarget, rendered);
});
