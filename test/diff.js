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
	it('should create patch for child append', function () {
		var from = {tag: 'div'};
		var to = {tag: 'div', children: ['text', 'text2']};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].childPatches.length.should.eql(2);
		patches[0].childPatches[0].should.eql({type: 'insert', child: 'text'});
		patches[0].childPatches[1].should.eql({type: 'insert', child: 'text2'});
	});
	it('should create patch for child insert at positions', function () {
		var from = {tag: 'div', children: [{tag: 'span'}]};
		var to = {tag: 'div', children: ['text', {tag: 'span'}, 'text2']};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].childPatches.length.should.eql(2);
		patches[0].childPatches[0].should.eql({type: 'insert', child: 'text', index: 0});
		patches[0].childPatches[1].should.eql({type: 'insert', child: 'text2', index: 2});
	});
	it('should create patch for child removal', function () {
		var from = {tag: 'div', children: ['text', {tag: 'span'}, 'text2']};
		var to = {tag: 'div', children: [{tag: 'span'}]};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].childPatches.length.should.eql(2);
		patches[0].childPatches[0].should.eql({type: 'remove', index: 2});
		patches[0].childPatches[1].should.eql({type: 'remove', index: 0});
	});
	it('should create patch to remove all children', function () {
		var from = {tag: 'div', children: ['text', {tag: 'span'}]};
		var to = {tag: 'div'};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].childPatches.length.should.eql(2);
		patches[0].childPatches[0].should.eql({type: 'remove', index: 0});
		patches[0].childPatches[1].should.eql({type: 'remove', index: 0});
	});
	it('should create patch for child replace', function () {
		var from = {tag: 'div', children: ['text', {tag: 'span'}]};
		var to = {tag: 'div', children: [{comment: 'comment1'}, {comment: 'comment2'}]};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].childPatches.length.should.eql(2);
		patches[0].childPatches[0].should.eql({type: 'replace', child: {comment: 'comment1'}, index: 0});
		patches[0].childPatches[1].should.eql({type: 'replace', child: {comment: 'comment2'}, index: 1});
	});
	it('should create diffs for children', function () {
		var from = {tag: 'div', children: [{tag: 'span'}]};
		var to = {tag: 'div', children: [{tag: 'span', class: ['foo']}]};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].node.should.eql([0]);
		patches[0].addClasses.should.eql(['foo']);
	});
	it('should modify and insert without `key`', function () {
		var from = {tag: 'div', children: [{tag: 'span', children: ['span1']}]};
		var to = {tag: 'div', children: [
			{tag: 'span', class: ['foo'], children: ['span2']},
			{tag: 'span', children: ['span1']}
		]};
		var patches = diff(from, to);
		patches.length.should.eql(3);
		patches[0].node.should.eql([0, 0]);
		patches[0].setContent.should.eql('span2');
		patches[1].node.should.eql([0]);
		patches[1].addClasses.should.eql(['foo']);
		patches[2].node.should.eql([]);
		patches[2].childPatches.should.eql([{type: 'insert', index: 1, child: {tag: 'span', children: ['span1']}}]);
	});
	it('should take `key` into account', function () {
		var from = {tag: 'div', children: [{tag: 'span', key: 1, children: ['span1']}]};
		var span2 = {tag: 'span', key: 2, class: ['foo'], children: ['span2']};
		var to = {tag: 'div', children: [
			span2,
			{tag: 'span', key: 1, children: ['still span1']}
		]};
		var patches = diff(from, to);
		patches.length.should.eql(2);
		patches[0].node.should.eql([0, 0]);
		patches[0].setContent.should.eql('still span1');
		patches[1].node.should.eql([]);
		patches[1].childPatches.should.eql([{type: 'insert', index: 0, child: span2}]);
	});
	it('should flatten the children before diffing', function () {
		var from = {
			tag: 'div',
			children: [
				['text1', 'text2', [{comment: 'text3'}]],
				['text4']
			]
		};
		var to = {
			tag: 'div',
			children: [
				[['text1'], 'text2'],
				[['text4']]
			]
		};
		var patches = diff(from, to);
		patches.length.should.eql(1);
		patches[0].childPatches.should.eql([{type: 'remove', index: 2}]);
	});
	it('should ignore undefined and null in children', function () {
		var from = {
			tag: 'div',
			children: [
				[null, [undefined]], [['text1']]
			]
		};
		var to = {
			tag: 'div',
			children: [
				[['text1', null], undefined]
			]
		};
		var patches = diff(from, to);
		patches.length.should.eql(0);
	});
	it('should ignore empty classes', function () {
		var from = {
			tag: 'div',
			class: [null, undefined, '', 'foo']
		};
		var to = {
			tag: 'div',
			class: ['foo']
		};
		var patches = diff(from, to);
		patches.length.should.eql(0);
	});
	it.skip('should create patch for child move', function () {
		
	});
});

