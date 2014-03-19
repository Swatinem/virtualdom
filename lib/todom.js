/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

module.exports = toDOM;

var svgElems = [];

function toDOM(vnode) {
	if (typeof vnode === 'string')
		return document.createTextNode(vnode);
	if (vnode.comment)
		return document.createComment(vnode.comment);

	var node = vnode.ns ?
		document.createElementNS(vnode.ns, vnode.tag) :
		document.createElement(vnode.tag);
	if (vnode.id)
		node.id = vnode.id;
	if (vnode.class.length)
		node.className = vnode.class.join(' ');
	var key;
	for (key in vnode.data)
		node.dataset[key] = vnode.data[key];
	for (key in vnode.style)
		node.style[key] = vnode.style[key];
	for (key in vnode.attributes) {
		node.setAttribute(key, vnode.attributes[key]);
	}
	vnode.children.forEach(function (child) {
		node.appendChild(toDOM(child));
	});
	return node;
}
