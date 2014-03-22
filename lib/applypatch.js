/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var toDOM = require('./todom');

module.exports = applyPatch;

function applyPatch(node, patch) {
	if (Array.isArray(patch))
		return patch.forEach(applyPatch.bind(this, node));
	// get to the node we want to modify
	for (var i = 0; i < patch.depth.length; i++) {
		var child = patch.depth[i];
		node = node.childNodes[child];
	}
	switch (patch.which) {
		case 'class':
			node.classList[patch.type === 'remove' ? 'remove' : 'add'](patch.class);
			if (!node.classList.length)
				node.removeAttribute('class');
			return;
		case 'attribute':
			if (patch.type === 'remove')
				return node.removeAttribute(patch.key);
			return node.setAttribute(patch.key, patch.value);
		case 'data':
		case 'style':
			var which = patch.which === 'data' ? 'dataset' : 'style';
			if (patch.type === 'remove') {
				if (which === 'dataset')
					return delete node.dataset[patch.key];
				node.style[patch.key] = null;
				if (!node.style.length)
					node.removeAttribute('style');
				return;
			}
			return node[which][patch.key] = patch.value;
		case 'node':
			if (patch.type === 'set')
				return node.data = patch.value;
			if (patch.type === 'remove')
				return node.parentNode.removeChild(node);
			var newNode = toDOM(patch.node);
			if (patch.before === undefined)
				return node.appendChild(newNode);
			return node.insertBefore(newNode, node.childNodes[patch.before]);
	}
}

