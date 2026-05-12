/**
 * JML - A lightweight JavaScript Markup Language library
 * Creates and renders virtual DOM-like objects into the actual DOM
 * 
 * @returns {Object} JML API object
 * @returns {Function} .h - Creates a JML element object
 * @returns {Function} .render - Renders JML objects into the DOM
 * 
 * @example
 * const { h, render } = JML();
 * const el = h('div', { class: 'container' }, 'Hello World');
 * render(document.body, el);
 */

const JML = () => {

    /**
     * Creates a JML element object representing a DOM element
     * 
     * @param {string} name - The HTML tag name (e.g., 'div', 'p', 'button')
     * @param {Object} [props] - Element properties and attributes
     *        - Event listeners: Use 'on' prefix (e.g., onClick, onChange)
     *        - innerHTML: Use 'innerHTML' key
     *        - HTML attributes: Use standard attribute names (e.g., class, id, data-*)
     * @param {string|number|Array|Object} [nest] - Child content
     *        - String or number: Text content
     *        - Array: Multiple children
     *        - JML object: Nested element
     * 
     * @returns {Object} JML element object with { name, props, children }
     * 
     * @example
     * h('button', { onClick: handleClick, class: 'btn' }, 'Click me')
     * h('div', { id: 'app' }, [
     *   h('h1', {}, 'Title'),
     *   h('p', {}, 'Content')
     * ])
     */
    const h = (name, props, nest) => ({ name, props, children: nest });

    const arr2Str = (s) => Array.isArray(s) ? s.join(" ") : String(s);

    const createTextNode = (content) => document.createTextNode(String(content));

    const createElement = (name, isSvg) => isSvg
        ? document.createElementNS("http://www.w3.org/2000/svg", name)
        : document.createElement(name);

    const setProp = (el, name, value) => {
        if (name.startsWith("on")) {
            const eventName = name.slice(2).toLowerCase();
            el.addEventListener(eventName, value, false);
        } else if (name.toLowerCase() === "innerhtml") {
            el.innerHTML = value;
        } else {
            el.setAttribute(name, arr2Str(value));
        }
    };

    const mountComponent = (root, jml) => {
        const componentEl = jml.mount(root);
        root.appendChild(componentEl);
        return componentEl;
    }
    /**
     * Renders JML object(s) into the DOM tree
     * 
     * @param {HTMLElement} root - The target DOM element to append to
     * @param {Object|Array} jml - JML element(s) to render
     *        - Single JML object: Renders one element
     *        - Array: Renders multiple children
     * 
     * @returns {HTMLElement} The rendered DOM element
     * 
     * @throws {Error} If jml is not a valid JML object
     * 
     * @example
     * const { h, render } = JML();
     * const app = h('div', { class: 'app' }, 'Hello');
     * render(document.getElementById('root'), app);
     */
    const render = (root, jml, isSVG = false) => {
        if (Array.isArray(jml)) {
            return nester(root, jml, isSVG);
        }
        
        if (isJMLMount(jml)) {
            // It's a component – mount it directly
            return mountComponent(root, jml);
        }
        if (!isJML(jml)) {
            throw Error("invalid JML object");
        }
        if (jml.name === "svg") {
            isSVG = true;
        }
        const el = createElement(jml.name, isSVG);
        
        if (jml.props) {
            for (const name in jml.props) {
                setProp(el, name, jml.props[name]);
            }
        }
        jml.el = el; // Store reference to rendered element
        root.appendChild(el);
        const event = new Event("create");
        el.dispatchEvent(event);
        if (!jml.children) {
            return el;
        }
        return nester(el, jml.children, isSVG);
    };

    // Recursively renders children (strings, numbers, or JML objects)
    function nester(el, n, isSVG) {
        if (typeof n === "string" || typeof n === "number") {
            el.appendChild(createTextNode(n));
        } else if (Array.isArray(n)) {
            n
            .filter(v => v !== null)
            .forEach((v) => {
                if (typeof v === "string" || typeof v === "number") {
                    el.appendChild(createTextNode(v));
                } else if (isJML(v)) {
                    render(el, v, isSVG);
                } else {
                    mountComponent(el, v);
                }
            });
        } else if (isJML(n)) {
            render(el, n, isSVG);
        }
        return el;
    }

    // Reactive
    const createComponent = (spec) => {
        let state = spec.initialState || {};
        let domNode = null;           // actual HTMLElement this component owns
        let parentNode = null;
        let nextSibling = null;

        const update = (newState) => {
            // Merge new state (shallow)
            state = { ...state, ...newState };
            // Re-render the component in place
            if (domNode && parentNode) {
                const newVNode = spec.render(state, update);
                const newDom = renderComponentToDom(newVNode);
                parentNode.replaceChild(newDom, domNode);
                domNode = newDom;
                return domNode;
            }
        };

        const renderComponentToDom = (vnode) => {
            // Use the existing JML render logic, but return the created element
            const tempRoot = document.createElement('span'); // temporary holder
            render(tempRoot, vnode);
            return tempRoot.firstChild; // the actual DOM element
        };

        const mount = (parent, beforeNode = null) => {
            parentNode = parent;
            nextSibling = beforeNode;
            const vnode = spec.render(state, update);
            domNode = renderComponentToDom(vnode);
            parent.insertBefore(domNode, beforeNode);
            return domNode;
        };

        return { mount, update: (newState) => update(newState) };
    };

    // Validates if an object is a valid JML object
    const isJML = (j) => j && typeof j === 'object' && 'name' in j && 'props' in j && 'children' in j;
    const isJMLMount = (j) => j && typeof j.mount === 'function';

    return { h, render, createComponent };

};
export default JML;