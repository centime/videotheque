/*jshint unused:false */

(function (exports) {

	'use strict';

	var STORAGE_KEY = 'netjuggler-videotheque-';

	exports.todoStorage = {
		fetch: function (varKey) {
			return JSON.parse(localStorage.getItem(STORAGE_KEY+varKey) || "[]");
		},
		save: function (todos, varKey) {
			localStorage.setItem(STORAGE_KEY+varKey, JSON.stringify(todos));
		}
	};

})(window);
