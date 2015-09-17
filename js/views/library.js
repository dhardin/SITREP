var app = app || {};

app.LibraryView = Backbone.View.extend({
    template: _.template($('#collection-template').html()),
    groupTemplate: _.template($('#group-template').html()),

    events: {
        'update-sort': 'updateSort'
    },

    initialize: function() {
   
        this.collection = app.LibraryCollection;
        this.childViews = [];

         this.collection.on('add reset remove', function() {
              this.render(this.collection);
       }, this);

        Backbone.pubSub.on('search', this.search, this);
    },

    render: function(options) {
        var collection = false,
            isFiltered = app.filterOptions,
            groupBy = false;
        options = options || false;

        collection = options ? options.collection || this.collection : this.collection;

        this.$el.html(!groupBy ? this.template() : this.groupTemplate());
        this.$items = (!groupBy ? this.$el.find('#items') : this.$el.find('.items'));

        this.$items.html('');

        if (!isFiltered) {
            if (collection.length > 0) {
                collection.each(function(item) {
                    this.renderItem(item);
                }, this);
            } else {
                this.$items.html($('#noItemsTemplate').html());
            }
        } else {
            var totalItems = this.collection.length,
                numItemsDisplayed = collection.length;
            this.$items.html('Displaying ' + numItemsDisplayed + ' out of ' + totalItems);
            collection.each(function(item) {
                this.renderItem(item);
            }, this);
        }


    },

    renderItem: function(item) {
        var itemView = new app.ItemView({
            model: item
        });


        this.childViews.push(itemView);

        this.$items.append(itemView.render().el);
    },

    onClose: function() {
        _.each(this.childViews, function(childView) {
            childView.remove();
            childView.unbind();
            if (childView.onClose) {
                childView.onClose();
            }
        });

        Backbone.pubSub.off('search');
    },

    updateSort: function(event, model, position) {
        this.collection.remove(model);

        this.collection.each(function(model, index) {
            var ordinal = index;
            if (index >= position) {
                ordinal += 1;
            }
            model.set('rank', ordinal + 1);
        });
        model.set('rank', position + 1);
        this.collection.add(model, {
            at: position
        });

        this.render(this.collection);
    },

    search: function(options) {
        if (options) {
            app.filterOptions = options;
            this.render({
                collection: this.collection.search(options),
                isFiltered: true
            });
        } else {
            app.filterOptions = false;
            this.render({
                collection: this.collection
            });
        }
    }
});
