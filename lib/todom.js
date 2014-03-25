/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var clean = require('./clean');

module.exports = toDOM;

function toDOM(vnode) {
	if (typeof vnode === 'string')
		return document.createTextNode(vnode);
	if (vnode.comment)
		return document.createComment(vnode.comment);

	var node = vnode.ns ?
		document.createElementNS(vnode.ns, vnode.tag) :
		document.createElement(vnode.tag);
	if (vnode.class && vnode.class.length)
		node.className = vnode.class.join(' ');
	var key;
	if (vnode.data)
		for (key in vnode.data)
			node.dataset[key] = vnode.data[key];
	if (vnode.style)
		for (key in vnode.style)
			node.style[key] = vnode.style[key];
	if (vnode.attributes)
		for (key in vnode.attributes)
			node.setAttribute(key, vnode.attributes[key]);
	if (vnode.children) {
		clean(vnode.children).forEach(function (child) {
			node.appendChild(toDOM(child));
		});
	}
	return node;
}
