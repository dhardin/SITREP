var app = app || {};

app.NavView = Backbone.View.extend({
    el: '#nav',

    events: {
        'keyup #search': 'onSearch',
        'input .start': 'onStartDateChange',
        'input .end': 'onEndDateChange',
        'click .department': 'onDepartmentChange'
    },

    initialize: function() {
        this.$search = this.$('#search');
        this.$calendar_large = this.$('.calendar.large');
        this.$calendar_small = this.$('.calendar.small');
        this.$calendars = this.$('.calendar');
        this.$start_date = this.$('.startDate');
        this.$end_date = this.$('.endDate');
        this.$toggle_bar = this.$('.toggle-topbar');
        this.$start = this.$('.start');
        this.$end = this.$('.end');
        this.$selectedDepartment = this.$('.selectedDepartment');
        this.date = {
            start: '',
            end: ''
        };

        (function(that) {
            that.$calendars.on('input', function(e) {
                //set set calendars equivalent to same value
                if (e.currentTarget.className.indexOf('start') > -1) {
                    that.onStartDateChange(e);
                } else {
                    that.onEndDateChange(e);
                }
                that.searchBetweenDates(that.$start[0].value, that.$end[0].value);
                e.stopPropagation();
            });
        })(this);

        if (app.fetchingData == false) {
            // this.searchDate(today);
        } else {
            (function(that) {
                app.dataLoadCallback = app.dataLoadCallback || [];
                app.dataLoadCallback.push(function() {
                    // that.searchDate(today);
                });
            })(this);

        }
    },
    onStartDateChange: function(e) {
        this.$end.attr('min', e.currentTarget.value);
        this.$start.each(function(index) {
            this.value = e.currentTarget.value;
        });
    },

    onEndDateChange: function(e) {
        this.$start.attr('max', e.currentTarget.value);
        this.$end.each(function(index) {
            this.value = e.currentTarget.value;
        });
    },

    onDepartmentChange: function(e) {
        var i,
            val = $(e.currentTarget).attr('data-value'),
            attribute = 'department';

        this.$selectedDepartment.text(val);

        app.filters = app.filters || {};
        app.filters.text = app.filters.text || [];
        for (i = 0; i < app.filters.text.length; i++) {
            if (app.filters.text[i].attribute == attribute) {
                if (val.length == 0) {
                    app.filters.text.splice(i, 1);
                } else {
                    app.filters.text[i].val = val;
                }
                Backbone.pubSub.trigger('search', app.filters);
                return;
            }
        }

        if (val.length == 0) {
            Backbone.pubSub.trigger('search', app.filters);
            return;
        }
        app.filters.text.push({
            val: val,
            attribute: attribute
        });

        Backbone.pubSub.trigger('search', app.filters);
    },

    searchBetweenDates: function(start, end) {
        app.filters = app.filters || {};
        app.filters.between = {
            start: start,
            end: end,
            attribute: 'created',
            formatAttrFunc: function(modified_date) {
                //format date to yyyy-mm-dd
                modified_date = modified_date.substring(0, 10);
                //format date to yyyymmdd
                modified_date = modified_date.replace(/-/g, '');

                return parseInt(modified_date);
            }
        };

        Backbone.pubSub.trigger('search', app.filters);
    },

    pad: function(num, size) {
        var s = num + '';
        while (s.length < size) {
            s = '0' + s;
        }
        return s;
    },


    onClose: function() {
        _.each(this.childViews, function(childView) {
            childView.remove();
            childView.unbind();
            if (childView.onClose) {
                childView.onClose();
            }
        });

        this.$calendars.off('input');
    },

    onSearch: function(e) {
        var i = 0,
            val = this.$search.val();
        app.filters = app.filters || {};
        app.filters.text = app.filters.text || [];

        for (i = 0; i < app.filters.text.length; i++) {
            if (!app.filters.text[i].attribute) {
                app.filters.text[i].val = val;
                Backbone.pubSub.trigger('search', app.filters);
                return;
            }
        }

        app.filters.text.push({
            val: val
        });

        Backbone.pubSub.trigger('search', app.filters);
    }
});
