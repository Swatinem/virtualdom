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

### diff(from, to)

Creates a list of patches to transform `from` to `to`.

### applyPatch(node, patches)

Applies a list of patches, see below for patch details.

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
	node: [], // chain of `childNodes` positions, starting at the room node
	// and patches, which are all optional:
	addClasses: [],
	removeClasses: [],
	setStyles: {},
	removeStyles: [],
	setAttributes: {},
	removeAttributes: [],
	setData: {},
	removeData: [],
	setContent: '', // for text and comment nodes
	childPatches: [/* see below */]
}
// and childPatches:
{
	type: 'insert',
	child: newChild,
	index: 0, // optional, will append if not set
}
{
	type: 'replace',
	child: newChild,
	index: 0, // required, index of the old child
}
{
	type: 'remove'
	index: 0
}
// might be good to have, but very difficult to implement as a diff
{
	type: 'move'
	from: 0, // old index
	to: 1 // new index
}
```

## TODO

* reorder / move child nodes
* support arrays as children (flatten)
* support innerHTML for unsafe code

## License

  LGPLv3

