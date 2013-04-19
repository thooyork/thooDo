(function(){

	
	//TodoList MODEL:
	var TodoListModel = Backbone.Model.extend({}); 
	var todolistmodel = new TodoListModel();



	//TodoItem MODEL:
	var TodoModel = Backbone.Model.extend({
		toggleStatus:function(){
			
			if(this.get('status') === 'incomplete'){
				this.set({'status':'complete'}); 
			}
			else{
				this.set({'status':'incomplete'});
			}

			//save Status to Server.

			this.save();
		},
		//toggle all
		resolveStatus:function(){
			this.set({'status':'complete'});
			this.save();
		}
	});



	//TodoList Model Collection:
	var TodoListCollection = Backbone.Collection.extend({
		model: TodoModel,

		localStorage: new Backbone.LocalStorage('todo-backbone'),

		allitems: function(){
			return this.length;
		},
		completed: function () {
			return this.filter(function (todo) {
				if (todo.get('status') == 'complete'){
					return true;
				}
			});
		},
		remaining: function () {
			return this.filter(function (todo) {
				if (todo.get('status') !== 'complete'){
					return true;
				}
			});
		}
	});
	var todolist = new TodoListCollection();





	//List / App View
	var TodoListView = Backbone.View.extend({
		el:'body',
	//	tagName : 'div',
	//	id: 'todolistcontainer',
	//	className: 'todolistcontainer',
	//	template: _.template('<h2>Todo - backbone.js</h2>' +
	//		'<input type="text" name="input" id="input" class="input" placeholder="What needs to be done ?"/>' + 
	//		'<ul id="todolist"></ul>' + 
	//		'<div class="footer"><span id="remaining"></span></div>' 
	//	),

template: _.template($('#todolistcontainer').html()),

		initialize:function(){
			$('#input').focus();
			this.listenTo(todolist, 'reset', this.addAll);
			todolist.fetch();		
		},
		render:function(){
    		this.$el.html(this.template(this.model.toJSON()));
    		return this;
		},
		events:{
			'keyup #input':'pressedEnter'
		},
		pressedEnter:function(e){
			var inp = $('#input');
			if(e.keyCode == 13 && !inp.val() == ''){
				this.addOne();
				inp.val('');
			}
		},
		addOne:function(){

			var todo = new TodoModel(
				{
					title: $('#input').val(),
					status:'incomplete'
				});
			
			var todoitemview = new TodoItemView({model: todo});
			$('#todolist').prepend(todoitemview.render().$el);

			//add model to collection:
			todolist.add(todo);

			//save model to Server
			todo.save();
		},
		addAll: function () {
			$('#todolist').html('');
			todolist.each(function(model){	
				var todoitemview = new TodoItemView({model: model});
				$('#todolist').prepend(todoitemview.render().$el.addClass(model.get('status')));
			}, this);
		}
	});




	//single TodoItem VIEW
	var TodoItemView = Backbone.View.extend({
		tagName: 'li',
		className: 'todo-li',
		template:_.template('<input class="check" type="checkbox" <% if (status === "complete"){ print("checked=\'checked\'") } %>/> ' +
			'<span class="title" ><%= title %></span>'+
			'<a href="#" class="deletebtn"></a>' +
			'<input type="text" value="<%=title%>" class="editinput" />'),
		render:function(){
			this.$el.addClass(this.model.get('status')).html(this.template(this.model.toJSON()));
			//console.log('renderd item LI ' + this.model.get('title'));
				$('#remaining').html(todolist.remaining().length);
			return this;
		},
		events:{
			'click .check':'toggleComplete',
			'click .deletebtn':'delEntry',
			'mouseover':'showIt',
			'mouseout':'hideIt',
			'dblclick .title':'editItem',
			'keyup .editinput':'changeItem',
			'blur .editinput':'closeEditModeAndSaveItem'
		},
		toggleComplete:function(){
			this.model.toggleStatus();

			if(this.model.get('status') === 'complete'){
				this.$el.addClass('complete');
			}
			else{
				this.$el.removeClass('complete');
			}

		},
		delEntry:function(){
			this.model.destroy();
		},
		showIt:function(){
			this.$el.find('.deletebtn').addClass('show');
		},
		hideIt:function(){
			this.$el.find('.deletebtn').removeClass('show');
		},
		initialize: function() {
    		 this.model.on('change', this.render, this);
    		 this.model.on('destroy', this.remove, this);
		},
		remove:function(){
			this.$el.remove();
			console.log(todolist.length);
		},
		editItem:function(){
			this.$el.addClass("editing");
			this.$el.find('.editinput').val(this.model.get('title')).focus();
		},
		changeItem:function(e){
			if(e.keyCode == 13){
				this.closeEditModeAndSaveItem();
			}
		},
		closeEditModeAndSaveItem:function(){
			var inp = this.$el.find('.editinput');
				if(!inp.val() == ''){
					this.model.set({'title': inp.val().trim()});
					this.model.save();
				}
			
			this.$el.removeClass("editing");
		}
	});


	//Render App
	var todolistview = new TodoListView({model:todolistmodel});
	//$('body').prepend(todolistview.render().$el);

	
})();