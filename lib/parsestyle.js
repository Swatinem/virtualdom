/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

module.exports = parseStyle;

// XXX: I know parsing via regexp is not very robust.
// problem is that using `getPropertyValue` of `CSSStyleDeclaration` is
// inconsistent through the browsers
function parseStyle(style) {
	var ret = Object.create(null);
	if (!style) return ret;
	var re = /\s*([\w\-]+)\s*:\s*([^;]*)\s*;?/g;
	var match;
	while (match = re.exec(style)) {
		ret[camelize(match[1])] = match[2];
	}
	return ret;
}

function camelize(str) {
	return str.replace(/\-(\w)/g, function (whole, char) {
		return char.toUpperCase();
	});
}
