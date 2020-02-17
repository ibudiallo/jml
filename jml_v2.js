function ml(name, props, nest) {
	return {
		name: name,
		props: props,
		children: nest,
	}
}

function render(root, jml) {
	var el = document.createElement(jml.name);
	if(jml.props) {
		for(var name in jml.props) {
			var value = jml.props[name];
			if(name.indexOf("on") === 0) {
				el.addEventListener(name.substr(2).toLowerCase(), value, false)
			} else {
				el.setAttribute(name, value);
			}
		}
	}
	root.appendChild(el);
	var event = new Event("create");
	el.dispatchEvent(event);
	if (!jml.children) {
		return el;
	}
	return nester(el, jml.children);
}

function nester(el, n) {
	if (typeof n === "string") {
		var t = document.createTextNode(n);
		el.appendChild(t);
	} else if (n instanceof Array) {
		for(var i = 0; i < n.length; i++) {
			if (typeof n[i] === "string") {
				var t = document.createTextNode(n[i]);
				el.appendChild(t);
			} else if (isJML(n[i])){
				render(el, n[i]);
			}
		}
	} else if (isJML(n)){
		render(el, n)
	}
	return el;
}

function isJML(j) {
	return j.hasOwnProperty("name") && j.hasOwnProperty("props") && j.hasOwnProperty("children");
}
