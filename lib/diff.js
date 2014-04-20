/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var clean = require('./clean');
var levenshtein = require('./levenshtein');

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
	        (typeof from.comment !== 'undefined' && typeof to.comment === 'undefined') ||
	        (typeof from.comment === 'undefined' && typeof to.comment !== 'undefined') ||
	        from.tag !== to.tag ||
	        from.ns !== to.ns));
}

function diffElem(from, to, node, patches) {
	if (from === to) return;

	var patch = {node: node};

	if (typeof from === 'string') {
		// these must be unequal, otherwise we would have returned already
		patch.setContent = to;
		patches.push(patch);
		return;
	}
	if (typeof to.comment !== 'undefined') {
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

	if (Object.keys(patch).length > 1)
		patches.push(patch);
}

function diffObject(from, to) {
	var key, keys, len, i;
	var set = Object.create(null);
	var remove = [];

	keys = Object.keys(from);
	len = keys.length;
	for (i = 0; i < len; i++) {
		key = keys[i];
		if (typeof to[key] === 'undefined')
			remove.push(key);
	}
	keys = Object.keys(to);
	len = keys.length;
	for (i = 0; i < len; i++) {
		key = keys[i];
		if (to[key] !== from[key])
			set[key] = to[key];
	}

	return {set: set, remove: remove};
}

function diffArray(from, to) {
	if (!from.length)
		return {add: to, remove: []};
	if (!to.length)
		return {add: [], remove: from};
	var fromSet = Object.create(null);
	var toSet = Object.create(null);
	var el, i;
	for (i = 0; i < from.length; i++) {
		el = from[i];
		if (el)
			fromSet[el] = true;
	}
	for (i = 0; i < to.length; i++) {
		el = to[i];
		if (el)
			toSet[el] = true;
	}

	var diff = diffObject(fromSet, toSet);
	return {add: Object.keys(diff.set), remove: diff.remove};
}

function diffChildren(from, to, node, patches) {
	var ret = [];

	from = clean(from.children);
	to = clean(to.children);

	// only additions
	if (!from.length) {
		return to.map(function (c) {
			return {type: 'insert', child: c};
		});
	}
	// only removals
	if (!to.length) {
		return from.map(function () {
			return {type: 'remove', index: 0};
		});
	}

	// separate common head and tail
	var head = 0;
	while (head < from.length && head < to.length &&
	       eql(from[head], to[head])) {
		diffElem(from[head], to[head], node.concat([head]), patches);
		head++;
	}
	var tail = 0;
	while (head + tail < from.length && head + tail < to.length &&
	       eql(from[from.length - 1 - tail], to[to.length - 1 - tail])) {
		diffElem(from[from.length - 1 - tail], to[to.length - 1 - tail], node.concat([from.length - 1 - tail]), patches);
		tail++;
	}

	// general operations
	var matrix = levenshtein.matrix(from.slice(head, from.length - tail), to.slice(head, to.length - tail), eql);
	var ops = levenshtein.operations(matrix);
	ops.forEach(function (op) {
		op.index += head;
		if (op.fromindex)
			op.fromindex += head;
		if (op.type === 'noop')
			return diffElem(from[op.fromindex], to[op.index],
			                node.concat([op.fromindex]), patches);
		if (op.type !== 'remove')
			op.child = to[op.index];
		ret.push(op);
	});
	return ret;
}

function eql(a, b) {
	return a === b || keyFunction(a) === keyFunction(b);
}

function keyFunction(node) {
	if (typeof node === 'string')
		return '#text';
	if (node.key)
		return node.key;
	if (typeof node.comment !== 'undefined')
		return '#comment';
	return '#' + node.ns + '#' + node.tag;
}
