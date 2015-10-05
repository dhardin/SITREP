var app = app || {};

app.EditItemView = Item.extend({
    tagName: 'div',
    template: _.template($('#edit-item-template').html()),

    events: {
        'click #saveBtn': 'onSaveClick',
        'click #closeBtn': 'onCloseClick',
        'click #deleteBtn': 'onDeleteClick'
    },

    initialize: function() {
        this.model.on('change:status', this.updateStatus, this);
        this.dropdown_html = '';

         for (var key in app.config.departments) {
             this.dropdown_html += '<option value="' + app.config.departments[key] + '">' + key + '</option>';
        }

    },

    render: function() {
        var department = this.model.get('department');

        this.$el.html(this.template((this.model ? this.model.toJSON() : {})));
        this.$statusMsg = this.$('.msg');
        this.$closeBtn = this.$('#closeBtn');
        this.$deleteBtn = this.$('#deleteBtn');
        this.$saveBtn = this.$('#saveBtn');
        this.$alert = this.$('.alert-box');
        this.$form = this.$('form');
        this.$description = this.$('#description');
        this.$description.val(app.config.defaults.description || '');
        CKEDITOR.config.height = 'auto';
        this.$description.ckeditor();
        this.$department_dropdown = this.$('#department_dropdown');
        this.formData = {};

        //populate dropdown menu
        this.$department_dropdown.html(this.dropdown_html);
        this.$department_dropdown.find('option[value="' + department + '"]').attr('selected', 'selected');
        return this;
    },
    updateStatus: function() {
        this.$statusMsg.text(this.model.get('status') + this.model.get('statusText'));
    },

    getFormData: function(obj) {
        //get form data
        if (Object.keys(obj).length === 0) {
            this.$form.find('.data').each(function(i, el) {
                if (el.getAttribute('data-sp-name') != '') {
                    obj[el.getAttribute('data-sp-name')] = $(el).val();
                }
            });
        }

        return obj;
    },

    saveToCollection: function(obj) {
        var item = this.model,
            key, newObj = {};
        for (key in obj) {
            newObj[key.toLowerCase()] = obj[key];
        }

        if (!app.LibraryCollection.get({
                cid: this.model.cid
            })) {
            item.set(newObj);
            app.LibraryCollection.add(item);
        } else {
            item.set(newObj);
        }
    },

    onSaveClick: function(e) {
        e.preventDefault();
        (function(that) {
            that.$deleteBtn.addClass('disabled');
            that.$saveBtn.addClass('disabled');

            that.setStatus({
                status: 'Saving',
                text: '...'
            });

            //get form data
            that.formData = that.getFormData(that.formData);


            if (that.model.get('id') !== '') {
                //set id property on formData object
                that.formData['ID'] = that.model.get('id');
            } else {
                //add aditional info required for our list..
                that.formData['Category'] = that.model.get('category');
                that.formData['Title'] = that.model.get('title');
            }
            setTimeout(function() {
                that.save({
                    method: (!app.LibraryCollection.get({
                        cid: that.model.cid
                    }) ? 'new' : 'update'),
                    callback: function(results) {
                        that.onSaveComplete(results);
                    },
                    trigger: false,
                    formData: that.formData
                });
            }, 10);
        })(this);
    },

    onSaveComplete: function(results) {
        this.$deleteBtn.removeClass('disabled');
        this.$saveBtn.removeClass('disabled');
        this.saveToCollection(this.formData);
        (function(that) {
            setTimeout(function() {
                that.setStatus({});
            }, 4000);
        })(this);
    },

    onCloseClick: function(e) {
        app.router.navigate('', {
            trigger: true
        });
        Backbone.pubSub.trigger('search', app.filters);
    },

    onDeleteClick: function(e) {
        e.preventDefault();
        this.setStatus({
            status: 'Deleting',
            text: ''
        });

        (function(that) {
            that.$deleteBtn.addClass('disabled');
            that.$saveBtn.addClass('disabled');
            setTimeout(function() {
                that.save({
                    method: 'delete',
                    callback: function() {
                        app.router.navigate('', {
                            trigger: true
                        });
                         Backbone.pubSub.trigger('search', app.filters);
                    },
                    trigger: false,
                    formData: {
                        ID: that.model.get('id')
                    }
                });
            }, 10);
        })(this);
    }
});
