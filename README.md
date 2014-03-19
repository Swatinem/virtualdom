# virtualdom

tools to work with a virtual dom

[![Build Status](https://travis-ci.org/Swatinem/virtualdom.png?branch=master)](https://travis-ci.org/Swatinem/virtualdom)
[![Coverage Status](https://coveralls.io/repos/Swatinem/virtualdom/badge.png?branch=master)](https://coveralls.io/r/Swatinem/virtualdom)
[![Dependency Status](https://gemnasium.com/Swatinem/virtualdom.png)](https://gemnasium.com/Swatinem/virtualdom)

## Installation

    $ component install Swatinem/virtualdom

## Usage

### Virtual DOM Node

A text node is simply a js string.

A comment node is `{comment: 'comment content'}`

And a normal node is represented as:

```js
{
	key: 'optional internal identifier used for sorting',
	tag: 'div',
	ns: 'optional namespace, like "http://www.w3.org/2000/svg" for svg'
	id: 'id',
	class: ['array', 'of', 'classes'],
	style: {position: 'absolute', borderRadius: '5px'},
	data: {dataset: 'key value pairs'}
	attributes: {'value': 'key value pairs for attributes'}
}
```

## License

  LGPLv3

