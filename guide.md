# JML Documentation

**JML** (JavaScript Markup Language) is a lightweight, zero‑dependency library for creating virtual DOM‑like objects and rendering them into the actual DOM. It provides a simple, declarative way to build and manipulate HTML elements using plain JavaScript objects.

## Installation

Include the library in your project by copying the `JML` function into your codebase or loading it as a module.

```html
<script src="jml.js"></script>
<script>
  const { h, render } = JML();
  // Use h and render
</script>
```

Or as an ES module:

```js
import JML from './jml.js';
const { h, render } = JML();
```

## Core Concepts

- **`h(name, props, nest)`** – Creates a JML element object (a plain JavaScript object) that describes a DOM node.
- **`render(root, jml)`** – Takes a real DOM element (`root`) and a JML object (or array of objects) and constructs the actual DOM tree inside `root`.

JML objects have the following structure:

```js
{
  name: 'div',          // HTML tag name
  props: {              // Optional – attributes, events, innerHTML
    class: 'container',
    onClick: () => {},
    innerHTML: '<b>bold</b>'
  },
  children: ...         // String, number, JML object, or array of these
}
```

### Special `props` handling

| Prop key          | Behaviour                                                                                     |
|-------------------|-----------------------------------------------------------------------------------------------|
| `onClick`, `onChange`, etc. | Event listener – the `on` prefix is removed, the rest is lowercased (e.g., `onClick` → `click`). |
| `innerHTML`       | Sets the element’s `innerHTML`. Overrides any children.                                       |
| Any other key     | Set as an HTML attribute. Values that are arrays are converted to space‑separated strings (useful for `class`). |

### The `"create"` event

After an element is created and appended to the DOM, JML dispatches a custom `"create"` event on that element. You can listen for it to perform additional initialisation.

## API Reference

### `h(name, props?, nest?)`

| Parameter | Type                          | Description                                                         |
|-----------|-------------------------------|---------------------------------------------------------------------|
| `name`    | `string`                      | HTML tag name (e.g., `'div'`, `'button'`, `'ul'`).                  |
| `props`   | `object` (optional)           | Properties, attributes, and event listeners.                        |
| `nest`    | `string`, `number`, `object`, `array` (optional) | Child content – text, a JML object, or an array of mixed types. |

**Returns** – A JML object `{ name, props, children }`.

#### Example

```js
const heading = h('h1', { class: 'title' }, 'Welcome');
const button = h('button', { onClick: () => alert('Hi!') }, 'Click me');
```

### `render(root, jml)`

| Parameter | Type                          | Description                                                         |
|-----------|-------------------------------|---------------------------------------------------------------------|
| `root`    | `HTMLElement`                 | Existing DOM element to which the content will be appended.        |
| `jml`     | `object` or `array`           | A JML object (from `h()`) or an array of JML objects.               |

**Returns** – The rendered DOM element (if a single JML object) or the `root` element (if an array). 

**Throws** – `Error` if `jml` is not a valid JML object.

> ⚠️ `render` appends content to `root`. It does **not** clear existing children. If you need to replace content, clear `root.innerHTML` first.

## Examples

### 1. Basic “Hello World”

```js
const { h, render } = JML();

const app = h('div', { id: 'app' }, 'Hello World!');
render(document.body, app);
```

### 2. Button with event handler

```js
const { h, render } = JML();

let count = 0;

const updateCounter = () => {
  count++;
  buttonEl.textContent = `Clicked ${count} times`;
};

const button = h('button', { onClick: updateCounter }, 'Click me');
const buttonEl = render(document.body, button);
```

### 3. Nested structure and array children

```js
const { h, render } = JML();

const items = ['Apple', 'Banana', 'Cherry'];
const listItems = items.map(fruit => h('li', { class: 'fruit-item' }, fruit));

const todoList = h('ul', { class: 'fruit-list' }, listItems);
render(document.getElementById('root'), todoList);
```

### 4. Using arrays for the `class` attribute

JML joins array values with spaces, which is especially useful for dynamic classes.

```js
const { h, render } = JML();

const isActive = true;
const button = h('button', {
  class: ['btn', 'btn-primary', isActive ? 'active' : 'inactive'],
  onClick: () => console.log('Clicked!')
}, 'Submit');

render(document.body, button);
// Rendered as: <button class="btn btn-primary active">Submit</button>
```

### 5. Using `innerHTML`

> **Caution:** When you set `innerHTML`, any children you pass to `h()` are ignored. Use `innerHTML` only with trusted content.

```js
const { h, render } = JML();

const card = h('div', { class: 'card', innerHTML: '<strong>Important</strong> message' });
render(document.body, card);
```

### 6. Listening to the `"create"` event

After rendering, each element dispatches a `"create"` event. You can use it to initialise a third‑party library or add extra behaviour.

```js
const { h, render } = JML();

const canvas = h('canvas', { width: 200, height: 200 });

canvas.props.onCreate = (el) => {
  const ctx = el.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 100, 100);
};

canvas.el?.addEventListener('create', (e) => {
  if (canvas.props.onCreate) canvas.props.onCreate(e.target);
});

render(document.body, canvas);
```

### 7. Rendering an array of JML objects directly

You can pass an array directly to `render` – each item will be appended to the root.

```js
const { h, render } = JML();

const paragraph = h('p', {}, 'First paragraph');
const divider = h('hr');
const anotherPara = h('p', {}, 'Second paragraph');

render(document.getElementById('content'), [paragraph, divider, anotherPara]);
```

### 8. Dynamic re‑rendering (manual approach)

JML does not automatically track state. For simple dynamic updates, you can reuse the stored JML objects and replace DOM content.

```js
const { h, render } = JML();

let counter = 0;
const root = document.getElementById('app');

function createCounterUI() {
  return h('div', {},
    h('span', {}, `Value: ${counter}`),
    h('button', { onClick: () => {
      counter++;
      // Re-render: clear root and render fresh
      root.innerHTML = '';
      render(root, createCounterUI());
    } }, 'Increment')
  );
}

render(root, createCounterUI());
```

### 9. Error handling for invalid JML

```js
const { h, render } = JML();

try {
  render(document.body, { not: 'a jml object' });
} catch (err) {
  console.error(err.message); // "invalid JML object"
}
```

## Notes & Limitations

- JML objects are **plain** – they do **not** provide a reactive update mechanism. Updates require manual re‑rendering or direct DOM manipulation.
- The `render` function **appends** to the target element. To replace content, clear the container first (e.g., `root.innerHTML = ''`).
- Event handlers are attached using `addEventListener`. They will not be automatically removed when the element is removed from the DOM – manage cleanup yourself if needed.
- The `"create"` event is dispatched synchronously after the element is appended. For elements created with `innerHTML`, the event is still dispatched on the container element itself.
- For performance, avoid passing large nested structures with many event handlers that are recreated on every render – consider attaching events to a parent with delegation.

## Reactive Components

JML includes `createComponent()` for building stateful, reactive UI elements. Components manage their own state and automatically re-render when the state changes.

### `createComponent(spec)`

| Parameter | Type | Description |
|-----------|------|-------------|
| `spec.initialState` | `object` (optional) | Starting state for the component. Default is `{}`. |
| `spec.render` | `function` (required) | Function that receives `(state, update)` and returns a JML object describing the UI. |

**Returns** – A component object with `mount()` and `update()` methods.

#### Component API

- **`mount(parent, beforeNode?)`** – Mounts the component into a parent element. Returns the rendered DOM element.
- **`update(newState)`** – Merges the new state and re-renders the component in place.

#### Example: Counter component

```js
const { h, createComponent } = JML();

const counter = createComponent({
  initialState: { count: 0 },
  render: (state, update) => {
    return h('div', { class: 'counter' }, [
      h('p', {}, `Count: ${state.count}`),
      h('button', { 
        onClick: () => update({ count: state.count + 1 })
      }, 'Increment'),
      h('button', { 
        onClick: () => update({ count: state.count - 1 })
      }, 'Decrement')
    ]);
  }
});

counter.mount(document.getElementById('app'));
```

#### Example: Todo app component

```js
const { h, createComponent } = JML();

const todoApp = createComponent({
  initialState: { todos: [], input: '' },
  render: (state, update) => {
    const todoItems = state.todos.map((todo, idx) => 
      h('li', { class: 'todo-item' }, [
        h('span', {}, todo),
        h('button', { 
          onClick: () => {
            const updated = state.todos.filter((_, i) => i !== idx);
            update({ todos: updated });
          }
        }, 'Delete')
      ])
    );

    return h('div', { class: 'todo-app' }, [
      h('h1', {}, 'My Todos'),
      h('div', { class: 'input-group' }, [
        h('input', { 
          type: 'text',
          placeholder: 'Enter a todo...',
          onChange: (e) => update({ input: e.target.value })
        }),
        h('button', { 
          onClick: () => {
            if (state.input.trim()) {
              update({ 
                todos: [...state.todos, state.input],
                input: ''
              });
            }
          }
        }, 'Add')
      ]),
      h('ul', { class: 'todo-list' }, todoItems)
    ]);
  }
});

todoApp.mount(document.getElementById('app'));
```

### How Components Work

1. When you call `mount()`, the component renders for the first time by calling your `render` function with the initial state.
2. The returned JML object is converted to actual DOM elements and inserted into the parent.
3. When `update()` is called, the component merges the new state and re-renders.
4. The new rendered DOM replaces the old one in place, maintaining the component's position in the tree.
5. Event handlers are attached fresh on each render.

### State Management

- State is managed **locally** within each component. Each component instance has its own isolated state.
- State updates are **shallow merged** – pass only the properties you want to change.
- Re-rendering happens **synchronously** – the DOM is updated immediately after `update()` is called.

## Summary

JML gives you a simple, framework‑agnostic way to build DOM structures using JavaScript objects. For static or template-like UIs, use `h()` and `render()`. For interactive, stateful UIs, use `createComponent()`. JML is ideal for small projects, prototypes, or as a learning tool to understand the "virtual DOM" concept without the overhead of a full reactive library.