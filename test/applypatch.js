/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var should = require('chaijs-chai').should();
var domify = require('component-domify');

var applyPatch = require('virtualdom').applyPatch;

describe('applyPatch', function () {
	it('should add attributes', function () {
		var node = domify('<h1></h1>');
		applyPatch(node, {
			type: 'insert',
			which: 'attribute',
			key: 'id',
			value: 'id',
			depth: []
		});
		node.id.should.eql('id');
		node.outerHTML.should.eql('<h1 id="id"></h1>');
	});
	it('should modify attributes', function () {
		var node = domify('<h1 id="foo"></h1>');
		node.id.should.eql('foo');
		applyPatch(node, {
			type: 'set',
			which: 'attribute',
			key: 'id',
			value: 'bar',
			depth: []
		});
		node.id.should.eql('bar');
		node.outerHTML.should.eql('<h1 id="bar"></h1>');
	});
	it('should remove attributes', function () {
		var node = domify('<h1 id="foo"></h1>');
		node.id.should.eql('foo');
		applyPatch(node, {
			type: 'remove',
			which: 'attribute',
			key: 'id',
			depth: []
		});
		node.id.should.eql('');
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should add classes', function () {
		var node = domify('<h1 class="foo"></h1>');
		node.className.should.eql('foo');
		applyPatch(node, {
			type: 'insert',
			which: 'class',
			class: 'bar',
			depth: []
		});
		node.className.should.include('bar');
	});
	it('should remove classes', function () {
		var node = domify('<h1 class="foo bar"></h1>');
		node.className.should.eql('foo bar');
		applyPatch(node, {
			type: 'remove',
			which: 'class',
			class: 'bar',
			depth: []
		});
		node.className.should.not.include('bar');
		node.outerHTML.should.eql('<h1 class="foo"></h1>');
	});
	it('should remove the class attribute if it becomes emptly', function () {
		var node = domify('<h1 class="foo"></h1>');
		node.className.should.eql('foo');
		applyPatch(node, {
			type: 'remove',
			which: 'class',
			class: 'foo',
			depth: []
		});
		node.className.should.not.include('foo');
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should add data attributes', function () {
		var node = domify('<h1></h1>');
		applyPatch(node, {
			type: 'insert',
			which: 'data',
			key: 'fooBar',
			value: 'foobar',
			depth: []
		});
		node.dataset.fooBar.should.eql('foobar');
		node.outerHTML.should.eql('<h1 data-foo-bar="foobar"></h1>');
	});
	it('should modify data attributes', function () {
		var node = domify('<h1></h1>');
		node.dataset.fooBar = 'foo?';
		applyPatch(node, {
			type: 'set',
			which: 'data',
			key: 'fooBar',
			value: 'foobar',
			depth: []
		});
		node.dataset.fooBar.should.eql('foobar');
		node.outerHTML.should.eql('<h1 data-foo-bar="foobar"></h1>');
	});
	it('should remove data attributes', function () {
		var node = domify('<h1 data-foo-bar="foobar"></h1>');
		applyPatch(node, {
			type: 'remove',
			which: 'data',
			key: 'fooBar',
			depth: []
		});
		should.not.exist(node.dataset.fooBar);
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should add new styles', function () {
		var node = domify('<h1></h1>');
		applyPatch(node, {
			type: 'insert',
			which: 'style',
			key: 'position',
			value: 'absolute',
			depth: []
		});
		node.style.position.should.eql('absolute');
		node.style.cssText.trim().should.eql('position: absolute;');
		// XXX: phantom, Y U insert trailing space?
		//node.outerHTML.should.eql('<h1 style="position: absolute;"></h1>');
	});
	it('should modify styles', function () {
		var node = domify('<h1 style="position: relative;"></h1>');
		applyPatch(node, {
			type: 'set',
			which: 'style',
			key: 'position',
			value: 'absolute',
			depth: []
		});
		node.style.position.should.eql('absolute');
		node.style.cssText.trim().should.eql('position: absolute;');
		// XXX: phantom, Y U insert trailing space?
		//node.outerHTML.should.eql('<h1 style="position: absolute;"></h1>');
	});
	it('should remove styles', function () {
		var node = domify('<h1 style="position: relative; top: 0px"></h1>');
		applyPatch(node, {
			type: 'remove',
			which: 'style',
			key: 'position',
			depth: []
		});
		node.style.position.should.eql('');
		node.style.cssText.trim().should.eql('top: 0px;');
		// XXX: phantom, Y U insert trailing space?
		//node.outerHTML.should.eql('<h1 style="top: 0px;"></h1>');
	});
	it('should remove the style attribute if it becomes emptly', function () {
		var node = domify('<h1 style="position: relative;"></h1>');
		applyPatch(node, {
			type: 'remove',
			which: 'style',
			key: 'position',
			depth: []
		});
		node.style.position.should.eql('');
		node.style.cssText.trim().should.eql('');
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should work on nested child nodes', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		applyPatch(node, {
			type: 'remove',
			which: 'style',
			key: 'position',
			depth: [2,1]
		});
		node.querySelector('h1').style.position.should.eql('');
		node.querySelector('h1').style.cssText.should.eql('');
		node.outerHTML.should.eql('<div>text<!--comment--><div>text<h1></h1></div></div>');
	});
	it('should apply an array of patches', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		applyPatch(node, [{
			type: 'remove',
			which: 'style',
			key: 'position',
			depth: [2,1]
		},{
			type: 'insert',
			which: 'class',
			class: 'foo',
			depth: [2,1]
		}]);
		node.querySelector('h1').style.position.should.eql('');
		node.querySelector('h1').style.cssText.should.eql('');
		node.querySelector('h1').className.should.eql('foo');
		node.outerHTML.should.eql('<div>text<!--comment--><div>text<h1 class="foo"></h1></div></div>');
	});
	it('should insert new nodes', function () {
		var node = domify('<div></div>');
		applyPatch(node, {
			type: 'insert',
			which: 'node',
			node: 'text',
			depth: []
		});
		node.firstChild.nodeType.should.eql(Node.TEXT_NODE);
		node.firstChild.data.should.eql('text');
		node.outerHTML.should.eql('<div>text</div>');
	});
	it('should insert new nodes before others', function () {
		var node = domify('<div><!--comment--></div>');
		applyPatch(node, {
			type: 'insert',
			which: 'node',
			node: 'text',
			before: 0,
			depth: []
		});
		node.firstChild.nodeType.should.eql(Node.TEXT_NODE);
		node.firstChild.data.should.eql('text');
		node.outerHTML.should.eql('<div>text<!--comment--></div>');
	});
	it('should remove nodes', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		applyPatch(node, {
			type: 'remove',
			which: 'node',
			depth: [2,1]
		});
		should.not.exist(node.querySelector('h1'));
		node.outerHTML.should.eql('<div>text<!--comment--><div>text</div></div>');
	});
});

