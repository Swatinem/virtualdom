/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

module.exports = clean;

function clean(arr) {
	var ret = [];
	if (!arr)
		return ret;
	arr.forEach(function (el) {
		if (Array.isArray(el))
			return clean(el).forEach(function (el) { ret.push(el); });
		if (el !== undefined && el !== null)
			ret.push(el);
	});
	return ret;
}

