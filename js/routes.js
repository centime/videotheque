/*global app, Router */

(function (app, Router) {

	'use strict';

	var router = new Router();

	// router.on('video/:id?', function (id) {
	// 	console.log('video selected: '+id);
	// 	app.currentVideoId = id;
	// });

	// router.on('videos/:_id	', function (_id) {
	// 	console.log('zob: '+_id);
	// 	// app.currentVideoId = id;
	// });

	// router.on('videos/:tags', function (tags) {
	// 	console.log('video list selected from tags: '+tags.split('-'));
	// 	app.selectedTags = tags.split('-');
	// });

	router.on('all', function () {
		app.visibility = 'all';
	});

	// todo bind it dynamically
	app.availableTags.forEach(function (visibility) {
		console.log(visibility);
		router.on(app.url(visibility), function () {
			app.visibility = visibility;
		});
	});

	router.configure({
		notfound: function () {
			window.location.hash = '';
			app.visibility = 'all';
		}
	});

	router.init();

})(app, Router);
