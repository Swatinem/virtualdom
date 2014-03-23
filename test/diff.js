/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

/*var should = */require('chaijs-chai').should();
// XXX: what did I get myself into?
// https://github.com/visionmedia/should.js/issues/43
var expect = require('chaijs-chai').expect;

var diff = require('virtualdom').diff;

describe('diff', function () {
	it('should throw when the type differs', function () {
		var err = 'can only diff nodes of same type';
		(function () {
			diff('text', {comment: 'comment'});
		}).should.throw(err);
		(function () {
			diff({comment: 'comment'}, 'text');
		}).should.throw(err);
		(function () {
			diff({comment: 'comment'}, {tag: 'div'});
		}).should.throw(err);
		(function () {
			diff({tag: 'div'}, {comment: 'comment'});
		}).should.throw(err);
		(function () {
			diff({tag: 'div'}, {tag: 'span'});
		}).should.throw(err);
		(function () {
			diff({tag: 'svg', ns: 'http://www.w3.org/2000/svg'},
			     {tag: 'svg', ns: 'http://www.w3.org/1999/xhtml'});
		}).should.throw(err);
	});
	it('should not emit patches if there is no difference', function () {
		var from = {tag: 'div', class: ['bar']};
		var to = {tag: 'div', class: ['bar']};
		var patches = diff(from, to);
		patches.length.should.eql(0);
	});
	it('should diff text and comments', function () {
		var d;

		diff('text', 'text').length.should.eql(0);
		d = diff('text', 'text2');
		d.length.should.eql(1);
		d[0].setContent.should.eql('text2');

		diff({comment: 'comment'}, {comment: 'comment'}).length.should.eql(0);
		d = diff({comment: 'comment'}, {comment: 'comment2'});
		d.length.should.eql(1);
		d[0].setContent.should.eql('comment2');
	});
	it('should diff class additions', function () {
		var from = {tag: 'div', class: ['bar']};
		var to = {tag: 'div', class: ['bar', 'foo']};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].addClasses.should.eql(['foo']);
	});
	it('should diff class removals', function () {
		var from = {tag: 'div', class: ['foo', 'bar']};
		var to = {tag: 'div', class: ['bar']};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].removeClasses.should.eql(['foo']);
	});
	[
		['Styles', 'style'],
		['Attributes', 'attributes'],
		['Data', 'data']
	].forEach(function (what) {
		it('should diff ' + what[1] + ' sets', function () {
			var from = {tag: 'div'};
			from[what[1]] = {top: '10px'};
			var to = {tag: 'div'};
			to[what[1]] = {top: '0px', position: 'fixed'};
			var patches = diff(from, to);
			patches.length.should.eql(1);
			expect(patches[0]['set' + what[0]]).to.eql({top: '0px', position: 'fixed'});
		});
		it('should diff ' + what[1] + ' removals', function () {
			var from = {tag: 'div'};
			from[what[1]] = {top: '0px', position: 'fixed'};
			var to = {tag: 'div'};
			var patches = diff(from, to);
			patches.length.should.eql(1);
			patches[0]['remove' + what[0]].should.eql(['top', 'position']);
		});
	});
	it.skip('should create patch for child insertion', function () {
		
	});
	it.skip('should create patch for child removal', function () {
		
	});
	it.skip('should create patch for child replace', function () {
		
	});
	it.skip('should create patch for child move', function () {
		
	});
});

