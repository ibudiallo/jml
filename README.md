# JML
A JavaScript Markup Languange in JavaScript

JML as described in [this article](https://idiallo.com/javascript/create-dom-elements-faster) makes it easier to create complex DOM hierarchies.

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

``` JavaScript
var overlay = ml("div", { id: "overlay"},
    ml("div", { class: "overlay__inner"},
	ml("div", { class: "overlay__box"}, [
	    ml("div", { class: "overlay__hdr"}, [
		ml("span", {
		    class: "overlay__close-btn",
		    onClick: function() {
			console.log("closing the overlay")
		    },
		}, "X"),
		ml("h3", {}, "Sign up"),
		ml("p", {}, "The coolest newsletter in town"),
	    ]),
	    ml("div", { class: "overlay__content"}, ["more content"]),
	])
    )
);
document.body.appendChild(overlay);
```

A simple elegant solution that follows a similar hierarchy of the original HTML.

There are two versions.

### Version 1 (jml_v1.js)

Version 1 creates DOM elements from the furthest child up to the parent. Then it returns the parent the you can manually append the parent to any Node you like:

``` JavaScript
var title = ml("h1", { id: "page-title", class: "main-title",}, "Title");
header.appendChild(title);
```

### Version 2 (jml_v2.js)

Version 2 create an temporary virtual DOM that holds the resulting hierarchy.

``` JavaScript
{
	name: "name",		// string
	props: Object,		// key value object
	children: Object,	// string object or array
}
```

Then the `render(root, result)` function is called with the root element and the virtual DOM as parameters. What this allows is to create objects from parent to child, and allows for an `onCreate` event.

``` JavaScript
var title = ml("h1", {
	id: "page-title",
	class: "main-title",
	onCreate: () => {
		console.log("title created")
	}, "Title");
render(header, title);
```
