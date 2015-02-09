var app = app || {};

var Router = Backbone.Router.extend({
	routes: {
		'': 'main',
		'new/': 'editItem',
		'new/*': 'editItem',
		'edit/:id': 'editItem',
		'edit/*': 'editItem',
		'search': 'search',
		'search/*': 'search'
	},

	 initialize: function(options){
	    this.AppView = options.AppView;
	  },
	
	main: function  () {
		var libraryView =  new app.LibraryView();
		   this.AppView.showView(libraryView);
	},

	editItem: function(id){
		if(app.fetchingData){ 
			var libraryView =  new app.LibraryView();
		   	this.AppView.showView(libraryView);
			app.fetchId = id;
			app.router = this;
			app.dataLoadCallback.push(function(){
				var item = (app.fetchId && app.LibraryCollection.get({id: app.fetchId}) ? 
					app.LibraryCollection.get({id: app.fetchId})
					: new app.Item());
				var editItemView = new app.EditItemView({model: item});
		
 				app.router.AppView.showView(editItemView);
			});
		} else {
			var item = (id ? 
					app.LibraryCollection.get({id: id})
					: new app.Item());
			var editItemView = new app.EditItemView({model: item});
		
 			this.AppView.showView(editItemView);
		}
		
	},
	search: function(val){
		
		var libraryView = new app.LibraryView({searchText: val});
		
 		this.AppView.showView(editItemView);
	}

});


var app_router = new Router({AppView: app.AppView});

Backbone.history.start();
