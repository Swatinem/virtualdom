/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var slice = [].slice;

module.exports = fromDOM;

function fromDOM(node) {
	var type = node.nodeType;
	if (type === Node.TEXT_NODE)
		return node.data;
	if (type === Node.COMMENT_NODE)
		return {comment: node.data};

	var v = {
		tag: node.tagName.toLowerCase(),
		ns: node.namespaceURI,
		id: node.id,
		class: slice.call(node.classList),
		style: getStyles(node.style),
		data: clone(node.dataset),
		attributes: getAttributes(node),
		children: slice.call(node.childNodes).map(fromDOM)
	};
	return v;
}

function getAttributes(node) {
	var ret = {};
	slice.call(node.attributes).forEach(function (attr) {
		var name = attr.name;
		if (~['id', 'style', 'class'].indexOf(name)) return;
		if (name.indexOf('data-') === 0) return;
		ret[name] = node.getAttribute(name);
	});
	return ret;
}

// XXX: I know parsing via regexp is not very robust.
// problem is that using `getPropertyValue` of `CSSStyleDeclaration` is
// inconsistent through the browsers
function getStyles(style) {
	var ret = {};
	if (!style || !style.cssText) return ret;
	style = style.cssText;
	var re = /\s*([\w\-]+)\s*:\s*([^;]*)\s*;?/g;
	var match;
	while (match = re.exec(style)) {
		ret[camelize(match[1])] = match[2];
	}
	return ret;
}

function camelize(str) {
	return str.replace(/\-(\w)/g, function (whole, char) {
		return char.toUpperCase();
	});
}

function clone(obj) {
	var ret = {};
	for (var key in obj) ret[key] = obj[key];
	return ret;
}

