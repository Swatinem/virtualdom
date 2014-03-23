/* vim: set shiftwidth=2 tabstop=2 noexpandtab textwidth=80 wrap : */
"use strict";

// FIXME: move this to an external dependency

// maybe take a look at the algorithm in https://github.com/kpdecker/jsdiff/blob/master/diff.js

exports.matrix = matrix;
exports.operations = operations;

// http://en.wikipedia.org/wiki/Levenshtein_distance#Iterative_with_full_matrix
function matrix(from, to, keyfn) {
	var matrix = [];
	var i, j;
	for (i = 0; i <= from.length; i++) {
		matrix[i] = [i];
	}
	for (j = 0; j <= to.length; j++) {
		matrix[0][j] = j;
	}
	// Fill in the rest of the matrix
	for (j = 1; j <= to.length; j++) {
		for (i = 1; i <= from.length; i++) {
			if(keyfn(from[i-1]) === keyfn(to[j-1])) {
				matrix[i][j] = matrix[i-1][j-1];
			} else {
				matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
				                        matrix[i  ][j-1] + 1, // insertion
				                        matrix[i-1][j  ] + 1); // deletion
			}
		}
	}
	return matrix;
}

// https://github.com/chrisdew/levenshtein-deltas
function operations(matrix) {
	var i = matrix.length - 1;
	var j = matrix[0].length - 1;
	var operations = [];
	while (i || j) {
		if (!i) {
			operations.unshift({type: 'insert', index: j-1});
			j--;
		} else if (!j) {
			operations.push({type: 'remove', index: i-1});
			i--;
		} else {
			var current = matrix[i][j];
			var above = matrix[i-1][j];
			var left = matrix[i][j-1];
			var diagonal = matrix[i-1][j-1];
			if (diagonal <= above && diagonal <= left) {
				if (current === diagonal)
					operations.push({type: 'noop', index: j-1, fromindex: i-1});
				else
					operations.unshift({type: 'replace', index: j-1});
				i--;
				j--;
			} else if (left <= above) {
				operations.unshift({type: 'insert', index: j-1});
				j--;
			} else { // if (above <= left)
				operations.push({type: 'remove', index: i-1});
				i--;
			}
		}
	}
	return operations;
}

