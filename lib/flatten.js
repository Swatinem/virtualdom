/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

module.exports = flatten;

function flatten(arr) {
	var ret = [];
	if (!arr)
		return ret;
	arr.forEach(function (el) {
		if (Array.isArray(el))
			return flatten(el).forEach(function (el) { ret.push(el); });
		ret.push(el);
	});
	return ret;
}

