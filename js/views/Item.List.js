var app = app || {};

app.ItemView = Item.extend({
	template: _.template($('#list-item-template').html()),
	tagName: 'li',
	className: 'list-item panel',

	events: {
		'click .editBtn': 'edit',
		'click .deleteBtn': 'delete',
		'click .show-more': 'toggleCollapse'
	},

	initialize: function (options) {
		
	},

	render: function () {
		var status = this.model.get('status'),
		 	statusText = this.model.get('statusText');
		this.$el.html(this.template(this.model.toJSON()));
		this.$alert = this.$('.alert-box');
		this.$deleteBtn = this.$('.deleteBtn');
		this.$editBtn = this.$('.editBtn');
		this.setStatus({status: status, text: statusText});
		this.$showMore = this.$('.show-more');
		this.$showMoreTop = this.$('.show-more.top');
		this.$description = this.$('.description')

		return this;
	},

	edit: function(e){
		var id = this.model.get('id');
		app.router.navigate('edit/' + id, { trigger: true });
	},

	delete: function(e) {
			e.preventDefault();
		this.setStatus({status: 'Deleting', text:''});
		(function(that){
			that.$deleteBtn.addClass('disabled');
			that.$editBtn.addClass('disabled');
			setTimeout(function(){
				that.save({
					method: 'delete',
					callback: function(){
						app.router.navigate('' , { trigger: true });
					},
					trigger: false,
					formData: { ID: that.model.get('id') }
				});
			},10);
		})(this);
	},

	onSortChange: function (e, index) {
		this.$el.trigger('update-sort', [this.model, index]);
	},

	toggleCollapse: function(e){
		if(this.$description.hasClass('collapse')){
			this.$description.removeClass('collapse').addClass('expand');
			this.$showMore.text('Show Less');
			this.$showMoreTop.show();
			
		} else {
			this.$description.removeClass('expand').addClass('collapse');
			this.$showMore.text('Show More');
			this.$showMoreTop.hide();
		}
		
	}


});
