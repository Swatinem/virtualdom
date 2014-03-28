/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

module.exports = clean;

function clean(arr) {
	var ret = [];
	if (!arr)
		return ret;
	for (var i = 0; i < arr.length; i++) {
		var el = arr[i];
		if (el === undefined || el === null)
			continue;
		if (Array.isArray(el))
			ret.push.apply(ret, clean(el));
		else
			ret.push(el);
	}
	return ret;
}

