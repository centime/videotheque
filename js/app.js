/*global Vue, todoStorage */

(function (exports) {

	'use strict';

	// get your own API key
	// https://console.developers.google.com/apis/library
	var ytApiKey = "AIzaSyBexCX3lDNBY4uEyu07zIRCB8xq82C_oBU";

	var inArray = function (val, array) {
		return array.indexOf(val) >= 0
	}

	exports.app = new Vue({

		// the root element that will be compiled
		el: '.todoapp',

		// app initial state
		data: {
			todos: todoStorage.fetch('videos'),
			newTodo: 'https://www.youtube.com/watch?v=fllDB3FK7pI',
			newTag: '',
			availableTags: todoStorage.fetch('tags'),
			editedTodo: null,
			visibility: 'all',
			currentVideo: todoStorage.fetch('videos')[0] || {}
		},

		// watch todos change for localStorage persistence
		watch: {
			todos: {
				deep: true,
				handler: function (todos){ todoStorage.save(todos, 'videos');}
			},
			availableTags: {
				deep: true,
				handler: function (tags){ todoStorage.save(tags, 'tags');}
			}
		},

		// computed properties
		// http://vuejs.org/guide/computed.html
		computed: {
			filteredTodos: function () {
				var visibility = this.visibility;
				if (!visibility || visibility === 'all') {
					return this.todos;
				}
				return this.todos.filter(function(todo){
					return (todo.tags.indexOf(visibility)>=0)
				})
			},
			remaining: function () {
				return filters.active(this.todos).length;
			},
			allDone: {
				get: function () {
					return this.remaining === 0;
				},
				set: function (value) {
					this.todos.forEach(function (todo) {
						todo.completed = value;
					});
				}
			}
		},

		// methods that implement data logic.
		// note there's no DOM manipulation here at all.
		methods: {

			url: function(str) {
				return urlize(str)
			},

			pluralize: function (word, count) {
				return word + (count === 1 ? '' : 's');
			},

			addTodo: function () {
				var value = this.newTodo && this.newTodo.trim();
				if (!value) {
					return;
				}
				// test if link is indeed a youtube video
				// todo: real resilient regexp
				var id = value.split('?v=')[1];
				var ytInfos = {};

				// get API data for video
				// https://developers.google.com/apis-explorer/?hl=fr#p/youtube/v3/
				// https://console.developers.google.com/apis/credentials?project=perso-dev-221809
				$.getJSON("https://www.googleapis.com/youtube/v3/videos", {
				  key: ytApiKey,
				  part: "snippet,statistics",
				  id: id
				}, function(data) {
				  if (data.items.length === 0) {
				    alert('Video not found.');
				    return;
				  }
				  onApiResponse(data);
				}).fail(function(jqXHR, textStatus, errorThrown) {
				  alert(jqXHR.responseText || errorThrown);
				});

				function onApiResponse(data){
				  ytInfos = data.items[0].snippet;
				  ytInfos['statistics'] = data.items[0].statistics; 
				  
				  createTodo(id, ytInfos);
				}
				var _this = this;
				function createTodo(id, ytInfos){
					_this.todos.push({ 
						id: _this.todos.length + 1,
						ytId: id, 
						title: ytInfos.title,
						thumbnail: ytInfos.thumbnails.default.url,
						channel: ytInfos.channelTitle,
						description: ytInfos.description,
						ytTags: ytInfos.tags,
						tags: [],
						completed: false,
						src: 'https://www.youtube.com/embed/'+id
					});
					_this.newTodo = '';
				}
				
			},
			createTag: function () {
				var value = this.newTag && this.newTag.trim();
				console.log(value);
				if (!value) {
					return;
				}
				console.log(value);

				if (!this.addTag(value)){ return }

				if (!(inArray(value, this.availableTags))) {
					console.log(value);
					this.availableTags.push(value);
					this.newTag = '';
					// update/access router.on()
				}
			},
			addTag: function (value) {
				var tags = this.currentVideo.tags;
				if (!value || inArray(value, tags)) {
					return false;
				}
				tags.push(value);
				return true
			},
			removeTag: function (tag) {
				var tags = this.currentVideo.tags;
				var index = tags.indexOf(tag);
				tags.splice(index, 1);
			},
			tagHref: function(tag) {
				return '#/'+urlize(tag)
			},
			selectVideo: function (todo) {
				this.currentVideo = todo;
				console.log(this.router.params);
			},

			removeTodo: function (todo) {
				var index = this.todos.indexOf(todo);
				this.todos.splice(index, 1);
			},


			editTodo: function (todo) {
				this.beforeEditCache = todo.title;
				this.editedTodo = todo;
			},

			doneEdit: function (todo) {
				if (!this.editedTodo) {
					return;
				}
				this.editedTodo = null;
				todo.title = todo.title.trim();
				if (!todo.title) {
					this.removeTodo(todo);
				}
			},

			cancelEdit: function (todo) {
				this.editedTodo = null;
				todo.title = this.beforeEditCache;
			},

			removeCompleted: function () {
				this.todos = filters.active(this.todos);
			},

			exportData: function() {
				console.log(this);
				alert(JSON.stringify({
					'videos': this.todos,
					'tags': this.availableTags
				}));
			},

			importData: function() {
				var str = prompt('json serialized string:');
				var json = JSON.parse(str);
				this.todos = json.videos;
				this.availableTags = json.tags;
			},

			setApiKey: function() {
				var key = prompt('get your own Youtube Public Data API key: https://console.developers.google.com/apis/library');
				ytApiKey = key;
			}
		},

		// a custom directive to wait for the DOM to be updated
		// before focusing on the input field.
		// http://vuejs.org/guide/custom-directive.html
		directives: {
			'todo-focus': function (el, binding) {
				if (binding.value) {
					el.focus();
				}
			}
		}
	});

})(window);
