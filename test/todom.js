/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

/*var should = */require('chaijs-chai').should();
/*var domify = require('component-domify');*/

var toDOM = require('virtualdom').toDOM;

describe('toDOM', function () {
	it('should handle text nodes', function () {
		var node = toDOM('text');
		node.nodeType.should.eql(Node.TEXT_NODE);
		node.data.should.eql('text');
		var n = document.createElement('div');
		n.appendChild(node);
		n.innerHTML.should.eql('text');
	});
	it('should handle comment nodes', function () {
		var node = toDOM({comment: 'comment'});
		node.nodeType.should.eql(Node.COMMENT_NODE);
		node.data.should.eql('comment');
		var n = document.createElement('div');
		n.appendChild(node);
		n.innerHTML.should.eql('<!--comment-->');
	});
	it('should create elements with ids', function () {
		var vnode = {
			tag: 'h1',
			attributes: {id: 'id'}
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('H1');
		node.id.should.eql('id');
		node.outerHTML.should.eql('<h1 id="id"></h1>');
	});
	it('should handle classes', function () {
		var vnode = {
			tag: 'h1',
			class: ['foo', 'bar', 'foo-bar', 'foo_bar']
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('H1');
		[].slice.call(node.classList).should.eql(vnode.class);
		node.outerHTML.should.eql('<h1 class="foo bar foo-bar foo_bar"></h1>');
	});
	it('should handle data attributes', function () {
		var vnode = {
			tag: 'h1',
			data: {foo: 'bar', bar: 'foo', fooBar: 'foobar'}
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('H1');
		node.dataset.should.eql(vnode.data);
		// XXX: the order of the attributes is reversed in FF
		//node.outerHTML.should.eql('<h1 data-foo="bar" data-bar="foo" data-foo-bar="foobar"></h1>');
	});
	it('should handle styles', function () {
		var vnode = {
			tag: 'h1',
			style: {
				position: 'absolute',
				top: '0px',
				// XXX: these are inconsistent throughout browsers
				//margin: '0px 1px 2px 3px',
				//borderRadius: '5px'
			}
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('H1');
		// XXX: lol, phantomjs inserts a trailing space here
		node.style.cssText.trim().should.eql('position: absolute; top: 0px;');
		// XXX: phantom, Y U insert trailing space?
		//node.outerHTML.should.eql('<h1 style="position: absolute; top: 0px;"></h1>');
	});
	it('should handle other attributes', function () {
		var vnode = {
			tag: 'input',
			attributes: {foo: 'bar', value: 'bar', bgcolor: 'red'}
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('INPUT');
		node.getAttribute('foo').should.eql('bar');
		node.getAttribute('value').should.eql('bar');
		// XXX: chromium sets value for all elements, FF only for input
		node.value.should.eql('bar');
		node.getAttribute('bgcolor').should.eql('red');
		// XXX: the order of the attributes is reversed in FF
		//node.outerHTML.should.eql('<h1 foo="bar" value="bar" bgcolor="red"></h1>');
	});
	it('should handle child nodes', function () {
		var vnode = {
			tag: 'h1',
			children: [
				'text1', {comment: 'comment'}, 'text2',
				{tag: 'br', attributes: {id: 'foo'}},
				'text3'
			]
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('H1');
		node.childNodes[0].nodeType.should.eql(Node.TEXT_NODE);
		node.childNodes[0].data.should.eql('text1');
		node.childNodes[1].nodeType.should.eql(Node.COMMENT_NODE);
		node.childNodes[1].data.should.eql('comment');
		node.childNodes[2].data.should.eql('text2');
		node.childNodes[3].nodeType.should.eql(Node.ELEMENT_NODE);
		node.childNodes[3].tagName.should.eql('BR');
		node.childNodes[3].id.should.eql('foo');
		node.childNodes[4].data.should.eql('text3');
		node.outerHTML.should.eql('<h1>text1<!--comment-->text2<br id="foo">text3</h1>');
	});
	it('should handle arrays in children', function () {
		var vnode = {
			tag: 'h1',
			children: [
				['text1', 'text2', ['text3']],
				['text4']
			]
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('H1');
		node.childNodes.length.should.eql(4);
		node.childNodes[0].data.should.eql('text1');
		node.childNodes[1].data.should.eql('text2');
		node.childNodes[2].data.should.eql('text3');
		node.childNodes[3].data.should.eql('text4');
	});
	it('should ignore undefined and null in children', function () {
		var vnode = {
			tag: 'h1',
			children: [[[undefined]], [null]]
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.tagName.should.eql('H1');
		node.childNodes.length.should.eql(0);
	});
	it('should handle svg', function () {
		var vnode = {
			tag: 'svg', ns: 'http://www.w3.org/2000/svg',
			children: [
				{tag: 'path', ns: 'http://www.w3.org/2000/svg',
					attributes: {d: 'M150 0 L75 200 L225 200 Z'}}
			]
		};
		var node = toDOM(vnode);
		node.nodeType.should.eql(Node.ELEMENT_NODE);
		node.should.be.an.instanceof(SVGSVGElement);
		node.tagName.should.eql('svg');
		node.childNodes[0].nodeType.should.eql(Node.ELEMENT_NODE);
		node.childNodes[0].should.be.an.instanceof(SVGPathElement);
		node.childNodes[0].tagName.should.eql('path');
		node.childNodes[0].getAttribute('d').should.eql('M150 0 L75 200 L225 200 Z');
		// XXX: phantom has no outerHTML for svg nodes
		var d = document.createElement('div');
		d.appendChild(node);
		d.innerHTML.should.eql('<svg><path d="M150 0 L75 200 L225 200 Z"></path></svg>');
	});
});

