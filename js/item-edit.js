var app = app || {};

app.EditItemView = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#edit-item-template').html()),

	events:{
		'click #saveBtn':'onSaveClick',
		'click #cancelBtn': 'onCancelClick'
	},

	initialize: function(){
		this.model.on('change', this.render, this);
	},

	render: function () {
		var department = this.model.get('department');
		this.$el.html(this.template((this.model ? this.model.toJSON() : {})));
		this.$cancelBtn = this.$('#cancelBtn');
		this.$saveBtn = this.$('#saveBtn');
		this.$alert = this.$('.alert-box');
		this.$form = this.$('form');
		this.$el.find('select option[value="'+department+'"]').attr('selected', 'selected');
		return this;
	},

	setStatus: function(statusOptions){
		var status = statusOptions.status || '',
			text = statusOptions.text || '';

		this.model.set('status', status);
		this.model.set('statusText', text);
		switch (status){
			case '':
					this.$alert
						.addClass('hidden')
						.removeClass('alert')
						.removeClass('success');
				break;
			case 'Saving':
				this.$alert
						.removeClass('success')
						.removeClass('hidden')
						.removeClass('alert');
			break;
			case 'Success':
					this.$alert
						.addClass('success')
						.removeClass('hidden')
						.removeClass('alert');
						
					break;
			case 'Error':
				this.$alert
					.addClass('alert')
					.removeClass('hidden')
					.removeClass('success');
					
				break;
			default:
				this.$alert
						.removeClass('hidden')
						.removeClass('alert')
						.removeClass('success');
				break
		}
	},

	save: function(options){
		options = options || {};
		var formData = options.formData || {},
			callback = options.callback || false, item,
			trigger = (typeof options.trigger !== 'undefined' ? options.trigger : true),
			method = options.method,
			that = this,
			data;

		this.setStatus({status: 'Saving', text: '...'});

		setTimeout(function(){
			//get form data
			formData = that.getFormData(formData);

			if(method != 'new'){
				//set id property on formData object
				formData['ID'] = that.model.get('id');
			}

			if(!app.testing){
				(function(callback,formData, that){
					that.saveToSharePoint(formData, method, function(results){
						if (results.error == ''){
							that.saveToCollection(formData);
							that.setStatus({status: 'Success', text: '!'});
						} else {
							that.setStatus({status: 'Error', text: ': ' + results.error});
						}
						if(trigger){
								app_router.navigate('edit/' + that.model.cid, { trigger: true });
							}
						if(callback){
							callback();
						}
					});
				})(callback, formData, that);
			} else {
				this.saveToCollection(formData);

		 		if(trigger){
					app_router.navigate('edit/' + this.model.cid, { trigger: true });
				}

				if(callback){
					callback();
				}
			}
		},10);
	},

	getFormData: function(obj){
		//get form data
		if (Object.keys(obj).length === 0){
			this.$form.find( '.data' ).each( function( i, el ) {
					if(el.id != ''){
						obj[ el.dataset.spName ] = $( el ).val();
					}
			});
		}

		return obj;
	},

	saveToCollection: function(obj){
		var item = this.model;

		if (!app.LibraryCollection.get({cid: this.model.cid})){
			item.set(obj);
			app.LibraryCollection.add(item);
		} else {
			item.set(obj);
		}
	},

	saveToSharePoint: function(obj, method, callback){
		app.spData.saveData({
			url: app.config_map.url,
			guid: app.config_map.guid,
			data: [obj],
			method: method,
			callback: callback
		});
	},

	onSaveClick: function(e) {
		e.preventDefault();
		(function(that){
			that.save({
				method: (!app.LibraryCollection.get({cid: that.model.cid}) ? 'new' : 'update'),
				callback: function(){
					setTimeout(function(){
						that.setStatus({});
					}, 4000);
				},
				trigger: false
			});
		})(this)
	}, 

	onCancelClick: function(e) {
		app_router.navigate('' , { trigger: true });
	}

});
