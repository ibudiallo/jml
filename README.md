# JML
A JavaScript Markup Languange in JavaScript

JML as described in [this article](https://idiallo.com/javascript/create-dom-elements-faster) makes it easier to create complex DOM hierarchies.

It's less than 1KB (1019 B) minified gzip

Creating nested elements like the following can be tedious:

``` HTML
<div id="overlay">
    <div class="overlay__inner">
		<div class="overlay__box">
			<div class="overlay__hdr">
			<span class="overlay__close-btn">X</span>
			<h3>Sign up</h3>
			<p>The coolest newsletter in town</p>
			</div>
			<div class="overlay__content">
			...
			</div>
		</div>
    </div>
</div>
```

The JavaScript equivalent goes like this:

``` JavaScript
var overElem = document.createElement("div");
overElem.id = "overlay";
var overInner = document.createElement("div");
overInner.className = "overlay__inner";
var overBox = document.createElement("div");
overBox.className = "overlay__box";
var overHdr = document.createElement("div");
overHdr.className = "overlay__hdr";
var clsBtn = document.createElement("span");
clsBtn.className = "overlay__close-btn";
var title = document.createElement("h3");
title.innerText = "Sign up";
var subtitle = document.createElement("p");
subtitle.innerText = "The coolest newsletter in town";

// a long while later

overHdr.appendChild(clsBtn);
overHdr.appendChild(title);
overHdr.appendChild(subtitle);
overBox.appendChild(overHdr);
...
```

Not only it is tedious, it is easy to introduce hard to debug errors.

## Simplifying things with JML

Here is how we can solve the same problem with JML:

```javascript
const overlay = h("div", { id: "overlay"},
    h("div", { class: "overlay__inner"},
		h("div", { class: "overlay__box"}, [
			h("div", { class: "overlay__hdr"}, [
				h("span", {
					class: "overlay__close-btn",
					onClick: () => {
						console.log("closing the overlay")
					},
				}, "X"),
				h("h3", {}, "Sign up"),
				h("p", {}, "The coolest newsletter in town"),
			]),
			h("div", { class: "overlay__content"}, ["more content"]),
		])
    )
);
render(document.body, overlay);
```

A simple elegant solution that follows a similar hierarchy of the original HTML.

## How It Works

JML creates a virtual DOM-like object structure that can be rendered into the actual DOM:

```javascript
const { h, render } = JML();

// Create a virtual DOM object
const title = h("h1", { 
  id: "page-title", 
  class: "main-title" 
}, "Title");

// Render it into the DOM
render(document.getElementById('header'), title);
```

The `h()` function creates a plain JavaScript object:

```javascript
{
  name: "h1",
  props: { id: "page-title", class: "main-title" },
  children: "Title"
}
```

Then `render()` converts this object into an actual DOM element and appends it to the target.

## Features

- **Simple API**: Just `h()` to create elements and `render()` to display them
- **Declarative**: Write DOM structures as nested function calls
- **Event handling**: Attach event listeners with the `on` prefix (e.g., `onClick`, `onChange`)
- **Array support**: Pass arrays of classes or children elements
- **SVG support**: Automatic SVG namespace handling when using `<svg>` tags
- **Reactive components**: Use `createComponent()` for stateful, re-renderable components
- **Zero dependencies**: Pure vanilla JavaScript

## Examples

### Creating a simple button

```javascript
const { h, render } = JML();

const button = h('button', {
  class: 'btn btn-primary',
  onClick: () => console.log('Clicked!')
}, 'Click me');

render(document.body, button);
```

### Building a todo list

```javascript
const { h, render } = JML();

const todos = ['Learn JML', 'Build a project', 'Share it'];
const todoItems = todos.map(todo => 
  h('li', { class: 'todo-item' }, todo)
);

const todoList = h('ul', { class: 'todo-list' }, todoItems);
render(document.getElementById('app'), todoList);
```

### Dynamic class arrays

```javascript
const { h, render } = JML();

const isActive = true;
const button = h('button', {
  class: ['btn', 'btn-primary', isActive ? 'active' : 'inactive']
}, 'Submit');

render(document.body, button);
// Renders as: <button class="btn btn-primary active">Submit</button>
```

### Reactive component with state

```javascript
const { h, render, createComponent } = JML();

const counter = createComponent({
  initialState: { count: 0 },
  render: (state, update) => {
    return h('div', { class: 'counter' }, [
      h('p', {}, `Count: ${state.count}`),
      h('button', { 
        onClick: () => update({ count: state.count + 1 })
      }, 'Increment')
    ]);
  }
});

render(document.getElementById('app'), counter);
```
