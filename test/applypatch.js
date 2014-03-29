/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

var should = require('chaijs-chai').should();
var domify = require('component-domify');

var applyPatch = require('virtualdom').applyPatch;

describe('applyPatch', function () {
	it('should add attributes', function () {
		var node = domify('<h1></h1>');
		applyPatch(node, {
			node: [],
			setAttributes: {id: 'id'}
		});
		node.id.should.eql('id');
		node.outerHTML.should.eql('<h1 id="id"></h1>');
	});
	it('should modify attributes', function () {
		var node = domify('<h1 id="foo"></h1>');
		node.id.should.eql('foo');
		applyPatch(node, {
			node: [],
			setAttributes: {id: 'bar'}
		});
		node.id.should.eql('bar');
		node.outerHTML.should.eql('<h1 id="bar"></h1>');
	});
	it('should remove attributes', function () {
		var node = domify('<h1 id="foo"></h1>');
		node.id.should.eql('foo');
		applyPatch(node, {
			node: [],
			removeAttributes: ['id']
		});
		node.id.should.eql('');
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should add classes', function () {
		var node = domify('<h1 class="foo"></h1>');
		node.className.should.eql('foo');
		applyPatch(node, {
			node: [],
			addClasses: ['bar']
		});
		node.className.should.include('bar');
	});
	it('should remove classes', function () {
		var node = domify('<h1 class="foo bar"></h1>');
		node.className.should.eql('foo bar');
		applyPatch(node, {
			node: [],
			removeClasses: ['bar']
		});
		node.className.should.not.include('bar');
		node.outerHTML.should.eql('<h1 class="foo"></h1>');
	});
	it('should remove the class attribute if it becomes emptly', function () {
		var node = domify('<h1 class="foo"></h1>');
		node.className.should.eql('foo');
		applyPatch(node, {
			node: [],
			removeClasses: ['foo']
		});
		node.className.should.not.include('foo');
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should add data attributes', function () {
		var node = domify('<h1></h1>');
		applyPatch(node, {
			node: [],
			setData: {fooBar: 'foobar'}
		});
		node.dataset.fooBar.should.eql('foobar');
		node.outerHTML.should.eql('<h1 data-foo-bar="foobar"></h1>');
	});
	it('should modify data attributes', function () {
		var node = domify('<h1 data-foo-bar="foo"></h1>');
		node.dataset.fooBar.should.eql('foo');
		applyPatch(node, {
			node: [],
			setData: {fooBar: 'bar'}
		});
		node.dataset.fooBar.should.eql('bar');
		node.outerHTML.should.eql('<h1 data-foo-bar="bar"></h1>');
	});
	it('should remove data attributes', function () {
		var node = domify('<h1 data-foo-bar="foobar"></h1>');
		applyPatch(node, {
			node: [],
			removeData: ['fooBar']
		});
		should.not.exist(node.dataset.fooBar);
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should add new styles', function () {
		var node = domify('<h1></h1>');
		applyPatch(node, {
			node: [],
			setStyles: {position: 'absolute'}
		});
		node.style.position.should.eql('absolute');
		node.style.cssText.trim().should.eql('position: absolute;');
		// XXX: phantom, Y U insert trailing space?
		//node.outerHTML.should.eql('<h1 style="position: absolute;"></h1>');
	});
	it('should modify styles', function () {
		var node = domify('<h1 style="position: relative;"></h1>');
		applyPatch(node, {
			node: [],
			setStyles: {position: 'absolute'}
		});
		node.style.position.should.eql('absolute');
		node.style.cssText.trim().should.eql('position: absolute;');
		// XXX: phantom, Y U insert trailing space?
		//node.outerHTML.should.eql('<h1 style="position: absolute;"></h1>');
	});
	it('should remove styles', function () {
		var node = domify('<h1 style="position: relative; top: 0px"></h1>');
		applyPatch(node, {
			node: [],
			removeStyles: ['position']
		});
		node.style.position.should.eql('');
		node.style.cssText.trim().should.eql('top: 0px;');
		// XXX: phantom, Y U insert trailing space?
		//node.outerHTML.should.eql('<h1 style="top: 0px;"></h1>');
	});
	it('should remove the style attribute if it becomes emptly', function () {
		var node = domify('<h1 style="position: relative;"></h1>');
		applyPatch(node, {
			node: [],
			removeStyles: ['position']
		});
		node.style.position.should.eql('');
		node.style.cssText.trim().should.eql('');
		node.outerHTML.should.eql('<h1></h1>');
	});
	it('should work on nested child nodes', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		var h1 = node.querySelector('h1');
		applyPatch(node, {
			node: [2,1],
			removeStyles: ['position']
		});
		h1.style.position.should.eql('');
		h1.style.cssText.should.eql('');
		node.outerHTML.should.eql('<div>text<!--comment--><div>text<h1></h1></div></div>');
	});
	it('should apply an array of patches', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		var h1 = node.querySelector('h1');
		applyPatch(node, [{
			node: [2,1],
			removeStyles: ['position']
		},{
			node: [2,1],
			addClasses: ['foo']
		}]);
		h1.style.position.should.eql('');
		h1.style.cssText.should.eql('');
		h1.className.should.eql('foo');
		node.outerHTML.should.eql('<div>text<!--comment--><div>text<h1 class="foo"></h1></div></div>');
	});
	it('should insert new nodes', function () {
		var node = domify('<div></div>');
		applyPatch(node, {
			node: [],
			childPatches: [
				{type: 'insert', child: 'text'}
			]
		});
		node.firstChild.nodeType.should.eql(Node.TEXT_NODE);
		node.firstChild.data.should.eql('text');
		node.outerHTML.should.eql('<div>text</div>');
	});
	it('should insert new nodes before others', function () {
		var node = domify('<div><!--comment--></div>');
		applyPatch(node, {
			node: [],
			childPatches: [
				{type: 'insert', child: 'text', index: 0}
			]
		});
		node.firstChild.nodeType.should.eql(Node.TEXT_NODE);
		node.firstChild.data.should.eql('text');
		node.outerHTML.should.eql('<div>text<!--comment--></div>');
	});
	it('should insert an array of nodes', function () {
		var node = domify('<div></div>');
		applyPatch(node, {
			node: [],
			childPatches: [
				{type: 'insert', child: ['text', {comment: 'comment'}]}
			]
		});
		node.firstChild.nodeType.should.eql(Node.TEXT_NODE);
		node.firstChild.data.should.eql('text');
		node.lastChild.nodeType.should.eql(Node.COMMENT_NODE);
		node.lastChild.data.should.eql('comment');
		node.outerHTML.should.eql('<div>text<!--comment--></div>');
	});
	it('should remove nodes', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		applyPatch(node, {
			node: [2],
			childPatches: [
				{type: 'remove', index: 1}
			]
		});
		should.not.exist(node.querySelector('h1'));
		node.outerHTML.should.eql('<div>text<!--comment--><div>text</div></div>');
	});
	it('should replace child nodes', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		applyPatch(node, {
			node: [2],
			childPatches: [
				{type: 'replace', index: 1, child: {tag: 'span', children: ['oh hai']}}
			]
		});
		should.not.exist(node.querySelector('h1'));
		node.querySelector('span').textContent.should.eql('oh hai');
		node.outerHTML.should.eql('<div>text<!--comment--><div>text<span>oh hai</span></div></div>');
	});
	it('should replace with an array of children', function () {
		var node = domify('<div>text<!--comment--><div>text<h1 style="position: relative;"></h1></div></div>');
		applyPatch(node, {
			node: [2],
			childPatches: [
				{type: 'replace', index: 1, child: ['oh hai', {comment: '2nd'}]}
			]
		});
		should.not.exist(node.querySelector('h1'));
		node.querySelector('div div').textContent.should.eql('textoh hai');
		node.outerHTML.should.eql('<div>text<!--comment--><div>textoh hai<!--2nd--></div></div>');
	});
	it.skip('should move children around', function () {
		
	});
	it('should change the content of text nodes', function () {
		var node = domify('<div>text<!--comment--></div>');
		var text = node.firstChild;
		applyPatch(node, {
			node: [0],
			setContent: 'text2'
		});
		text.data.should.eql('text2');
		node.outerHTML.should.eql('<div>text2<!--comment--></div>');
	});
	it('should change the content of comment nodes', function () {
		var node = domify('<div>text<!--comment--></div>');
		var comment = node.lastChild;
		applyPatch(node, {
			node: [1],
			setContent: 'comment2'
		});
		comment.data.should.eql('comment2');
		node.outerHTML.should.eql('<div>text<!--comment2--></div>');
	});
});

