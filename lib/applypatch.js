/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var toDOM = require('./todom');

module.exports = applyPatch;

function applyPatch(node, patch) {
	if (Array.isArray(patch))
		return patch.forEach(applyPatch.bind(null, node));
	// get to the node we want to modify
	for (var i = 0; i < patch.node.length; i++) {
		var child = patch.node[i];
		node = node.childNodes[child];
	}

	var key;

	if (patch.addClasses)
		patch.addClasses.forEach(function (klass) { node.classList.add(klass); });
	if (patch.removeClasses)
		patch.removeClasses.forEach(function (klass) { node.classList.remove(klass); });
	// XXX: because browsers don’t do this automatically:
	if (node.classList && !node.classList.length)
		node.removeAttribute('class');

	if (patch.setStyles) {
		for (key in patch.setStyles)
			node.style[key] = patch.setStyles[key];
	}
	if (patch.removeStyles)
		patch.removeStyles.forEach(function (key) { node.style[key] = null; });
	// XXX: because browsers don’t do this automatically:
	if (node.style && !node.style.length)
		node.removeAttribute('style');

	if (patch.setAttributes) {
		for (key in patch.setAttributes)
			node.setAttribute(key, patch.setAttributes[key]);
	}
	if (patch.removeAttributes)
		patch.removeAttributes.forEach(node.removeAttribute.bind(node));

	if (patch.setData) {
		for (key in patch.setData)
			node.dataset[key] = patch.setData[key];
	}
	if (patch.removeData)
		patch.removeData.forEach(function (key) { delete node.dataset[key]; });

	if ('setContent' in patch)
		node.data = patch.setContent;

	if (patch.childPatches)
		patch.childPatches.forEach(applyChildPatch.bind(null, node));
}

function applyChildPatch(node, patch) {
	var newNode = patch.child && toDOM(patch.child);
	switch (patch.type) {
	case 'insert':
		return node.insertBefore(newNode, node.childNodes[patch.index]);
	case 'remove':
		return node.removeChild(node.childNodes[patch.index]);
	case 'replace':
		return node.replaceChild(newNode, node.childNodes[patch.index]);
	case 'move':
		throw new Error('not implemented');
		//return;
	}
}

