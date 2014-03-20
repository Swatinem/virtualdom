# virtualdom

tools to work with a virtual dom

[![Build Status](https://travis-ci.org/Swatinem/virtualdom.png?branch=master)](https://travis-ci.org/Swatinem/virtualdom)
[![Coverage Status](https://coveralls.io/repos/Swatinem/virtualdom/badge.png?branch=master)](https://coveralls.io/r/Swatinem/virtualdom)
[![Dependency Status](https://gemnasium.com/Swatinem/virtualdom.png)](https://gemnasium.com/Swatinem/virtualdom)

## Inspiration

[React](http://facebook.github.io/react/) is probably the first to have done this
and gain massive hype with it. However it grew extremely large, being >500k
unminified.

[mithril.js](https://github.com/lhorie/mithril.js) also has a virtual dom and
claims to do dom diffing. However, it is a complete MVC framework, complete with
its own promises implementation, xhr, etc. But at least it is very small, although
not very readable.

[virtual-dom](https://github.com/Matt-Esch/virtual-dom) seems like a very good
solution. It is made for use with browserify and pulls in the complete `semver`
package as a dependency *facepalm*.

And of course, I don’t want to merely *use* a library. I want to
*know and understand* the technology, so I might as well implement it myself :-)

## Installation

    $ component install Swatinem/virtualdom

## Usage

### fromDOM(node)

Creates a virtual dom node for the real DOM `node`.

### toDOM(vnode)

Creates a real DOM node for the virtual dom `vnode`.

### applyPatch(node, patches)

Applies a list of patches, see below for patch details

## Internal data structures

### Virtual DOM Node

A text node is simply a js string.

A comment node is `{comment: 'comment content'}`

And a normal node is represented as:

```js
{
	key: 'optional internal identifier used for sorting',
	tag: 'div',
	ns: 'optional namespace, like "http://www.w3.org/2000/svg" for svg'
	class: ['array', 'of', 'classes'],
	style: {position: 'absolute', borderRadius: '5px'},
	data: {dataset: 'key value pairs'}
	attributes: {'id': 'id', 'value': 'key value pairs for attributes'}
}
```

`class`, `data` and `style` are handled separately from other attributes
since they have array or hashtable-like accessors in the real DOM.

### Patch

```js
{
	type: 'insert' || 'remove' || 'set',
	which: 'node' || 'attribute' || 'class' || 'style' || 'data',
	depth: [], // the position of the target DOM node as a chain of child positions
	node: virtualDomNode, // in case we `insert` a `node`
	before: 0, // in case we `insert` a `node`
	class: className, // in case we `insert` or `remove` a `class`
	key: key, // name of the `attribute`, `style` or `data` we want to `set` or `remove`
	value: value // value of the `attribute`, `style` or `data` we want to `set`
}
```

## License

  LGPLv3

