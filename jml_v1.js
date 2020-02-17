function ml(tagName, props, nest) {
	var el = document.createElement(tagName);
	if(props) {
		for(var name in props) {
			if(name.indexOf("on") === 0) {
				el.addEventListener(name.substr(2).toLowerCase(), props[name], false)
			} else {
				el.setAttribute(name, props[name]);
			}
		}
	}
	if (!nest) {
		return el;
	}
	if (typeof nest === "string") {
		var t = document.createTextNode(nest);
		el.appendChild(t);
	} else if (nest instanceof Array) {
		for(var i = 0; i < nest.length; i++) {
			if (typeof nest[i] === "string") {
				var t = document.createTextNode(nest[i]);
				el.appendChild(t);
			} else if (nest[i] instanceof Node){
				el.appendChild(nest[i]);
			}
		}
	} else if (nest instanceof Node){
		el.appendChild(nest)
	}
	return el;
}
