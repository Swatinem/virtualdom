/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var slice = [].slice;
var parseStyle = require('./parsestyle');

module.exports = fromDOM;

function fromDOM(node) {
	var type = node.nodeType;
	if (type === Node.TEXT_NODE)
		return node.data;
	if (type === Node.COMMENT_NODE)
		return {comment: node.data};
	if (type === Node.DOCUMENT_FRAGMENT_NODE)
		return slice.call(node.childNodes).map(fromDOM);

	var v = {
		tag: node.tagName.toLowerCase(),
		ns: node.namespaceURI,
		class: slice.call(node.classList),
		style: parseStyle(node.style.cssText),
		data: clone(node.dataset),
		attributes: getAttributes(node),
		children: slice.call(node.childNodes).map(fromDOM)
	};
	return v;
}

function getAttributes(node) {
	var ret = Object.create(null);
	slice.call(node.attributes).forEach(function (attr) {
		var name = attr.name;
		if (~['style', 'class'].indexOf(name)) return;
		if (name.indexOf('data-') === 0) return;
		ret[name] = node.getAttribute(name);
	});
	return ret;
}

function clone(obj) {
	var ret = Object.create(null);
	for (var key in obj) ret[key] = obj[key];
	return ret;
}

