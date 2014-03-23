/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

module.exports = diff;

function diff(from, to) {
	// only the root needs to be of same type, otherwise we just modify children
	if (typeDiffers(from, to))
		throw new Error('can only diff nodes of same type');

	var node = [];
	var patches = [];
	diffElem(from, to, node, patches);
	return patches;
}

function typeDiffers(from, to) {
	return (typeof from !== typeof to || typeof from === 'object' && (
	        ( ('comment' in from) && !('comment' in to)) ||
	        (!('comment' in from) &&  ('comment' in to)) ||
	        from.tag !== to.tag ||
	        from.ns !== to.ns));
}

function diffElem(from, to, node, patches) {
	var patch = {node: node};

	if (typeof from === 'string') {
		if (from !== to) {
			patch.setContent = to;
			patches.push(patch);
		}
		return;
	}
	if ('comment' in to) {
		if (from.comment !== to.comment) {
			patch.setContent = to.comment;
			patches.push(patch);
		}
		return;
	}

	var diff = diffArray(from.class || [], to.class || []);
	if (diff.add.length)
		patch.addClasses = diff.add;
	if (diff.remove.length)
		patch.removeClasses = diff.remove;

	var empty = Object.create(null);
	[
		['Styles', 'style'],
		['Attributes', 'attributes'],
		['Data', 'data']
	].forEach(function (what) {
		var diff = diffObject(from[what[1]] || empty, to[what[1]] || empty);
		if (Object.keys(diff.set).length)
			patch['set' + what[0]] = diff.set;
		if (diff.remove.length)
			patch['remove' + what[0]] = diff.remove;
	});

	var childPatches = diffChildren(from, to, node, patches);
	if (childPatches.length)
		patch.childPatches = childPatches;

	if (patch.addClasses || patch.removeClasses ||
	    patch.setStyles || patch.removeStyles ||
	    patch.setAttributes || patch.removeAttributes ||
	    patch.setData || patch.removeData ||
	    patch.childPatches)
		patches.push(patch);
}

function diffObject(from, to) {
	var key;
	var set = Object.create(null);
	var remove = [];

	for (key in from)
		if (!(key in to))
			remove.push(key);
	for (key in to)
		if (!(key in from) || to[key] !== from[key])
			set[key] = to[key];

	return {set: set, remove: remove};
}

function diffArray(from, to) {
	var fromSet = Object.create(null);
	var toSet = Object.create(null);
	from.forEach(function (key) { fromSet[key] = true; });
	to.forEach(function (key) { toSet[key] = true; });

	var diff = diffObject(fromSet, toSet);
	return {add: Object.keys(diff.set), remove: diff.remove};
}

function diffChildren(from, to, node, patches) {
	var ret = [];
	// TODO: diff children
	// TODO: recurse to children that did not change position
	return ret;
}
