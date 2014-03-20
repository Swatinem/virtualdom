/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

/*var should = */require('chaijs-chai').should();
var domify = require('component-domify');

var fromDOM = require('virtualdom').fromDOM;

describe('fromDOM', function () {
	it('should work with text nodes', function () {
		var el = domify('<h1>text</h1>');
		fromDOM(el.firstChild).should.eql('text');
	});
	it('should work with comment nodes', function () {
		var el = domify('<h1><!--text--></h1>');
		fromDOM(el.firstChild).should.eql({comment: 'text'});
	});
	it('should get the correct tag name', function () {
		var el = domify('<h1></h1>');
		fromDOM(el).should.include({tag: 'h1'});
		el = domify('<br />');
		fromDOM(el).should.include({tag: 'br'});
	});
	it('should include the id', function () {
		var el = domify('<h1 id="foo"></h1>');
		fromDOM(el).attributes.should.include({id: 'foo'});
		el = domify('<br id="bar" />');
		fromDOM(el).attributes.should.include({id: 'bar'});
	});
	it('should give a list of classes', function () {
		var el = domify('<h1 class="foo"></h1>');
		fromDOM(el).class.should.include.members(['foo']);
		el = domify('<br class="foo bar foo-bar foo_bar" />');
		fromDOM(el).class.should.include.members(['foo', 'bar', 'foo-bar', 'foo_bar']);
	});
	it('should serialize the dataset', function () {
		var el = domify('<h1 data-foo="bar"></h1>');
		fromDOM(el).data.should.include({foo: 'bar'});
		el = domify('<br data-foo="bar" data-bar="foo" data-foo-bar="foobar" />');
		fromDOM(el).data.should.include({foo: 'bar', bar: 'foo', fooBar: 'foobar'});
	});
	it('should serialize the styles', function () {
		var el = domify('<h1 style="position: absolute;"></h1>');
		fromDOM(el).style.should.include({position: 'absolute'});
		el = domify('<br style="position: absolute; top: 0px; margin: 0px 1px 2px 3px; border-radius: 5px;" />');
		fromDOM(el).style.should.include({
			position: 'absolute',
			top: '0px',
			// XXX: FF and chromium are inconsistent here
			//margin: '0px 1px 2px 3px',
			//borderRadius: '5px'
		});
	});
	it('should extract all the other attributes', function () {
		var el = domify('<h1 foo="bar"></h1>');
		fromDOM(el).attributes.should.include({foo: 'bar'});
		el = domify('<h1 foo="bar" value="foo" bgcolor="bar"></h1>');
		fromDOM(el).attributes.should.include({foo: 'bar', value: 'foo', bgcolor: 'bar'});
		el = domify('<h1 id="foo" class="bar" style="margin: 10px;" data-foo="bar" data-foo-bar="foobar"></h1>');
		fromDOM(el).attributes.should.eql({id: 'foo'});
	});
	it('should generate a list of children', function () {
		var el = domify('<h1>text1<!--comment-->text2<br id="foo" />text3</h1>');
		var v = fromDOM(el);
		v.children.length.should.eql(5);
		v.children[0].should.eql('text1');
		v.children[1].should.eql({comment: 'comment'});
		v.children[2].should.eql('text2');
		v.children[3].should.include({tag: 'br'});
		v.children[3].attributes.should.include({id: 'foo'});
		v.children[4].should.eql('text3');
	});
	it('should handle svg', function () {
		var el = domify('<svg><path d="M150 0 L75 200 L225 200 Z"/></svg>');
		el.should.be.an.instanceof(SVGSVGElement);
		var v = fromDOM(el);
		v.ns.should.eql('http://www.w3.org/2000/svg');
		v.tag.should.eql('svg');
		v.data.should.eql({});
		v.children.length.should.eql(1);
		v.children[0].tag.should.eql('path');
		v.children[0].attributes.should.include({d: 'M150 0 L75 200 L225 200 Z'});
	});
});

