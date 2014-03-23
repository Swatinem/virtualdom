/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

/*var should = */require('chaijs-chai').should();
var domify = require('component-domify');

var v = require('virtualdom');

describe('virtualdom', function () {
	it('should handle the whole pipeline for a single element', function () {
		var fromStr = '<div></div>';
		var toStr = '<div id="foo" class="foo bar" style="top: 10px" data-foo-bar="foobar"></div>';
		var node = domify(fromStr);
		var toNode = domify(toStr);
		var from = v.fromDOM(node);
		var to = v.fromDOM(toNode);

		var patches;
		patches = v.diff(from, to);
		v.applyPatch(node, patches);

		v.fromDOM(node).should.deep.eql(to);
		// XXX: depends on the ordering and is unreliable
		//node.outerHTML.should.eql(toStr);

		patches = v.diff(to, from);
		v.applyPatch(node, patches);

		v.fromDOM(node).should.deep.eql(from);
		node.outerHTML.should.eql(fromStr);
	});
});

