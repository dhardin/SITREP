var app = app || {};

app.NavView = Backbone.View.extend({
    el: '#nav',

    events: {
        'keyup #search': 'onSearch',
        'click .selectDate': 'onSelectDateClick',
        'click .clearDate': 'onClearClick',
        'click .date-label': 'onDateLabelClick'
    },

    initialize: function() {
        //_.bindAll(this, 'onSearch');
        this.$search = this.$('#search');
        this.$week_picker_large = this.$('.week-picker.large');
        this.$week_picker_small = this.$('.week-picker.small');
        this.$week_pickers = this.$('.week-picker');
        this.$start_date = this.$('.startDate');
        this.$end_date = this.$('.endDate');
        this.$toggle_bar = this.$('.toggle-topbar');
        this.date = {
            start: '',
            end: ''
        };

        (function(that) {
            that.$week_pickers.datepicker({
                showOtherMonths: true,
                selectOtherMonths: true,
                onSelect: function(dateText, inst) {
                    that.$week_pickers.find('.ui-datepicker-calendar tr td a').removeClass('ui-state-hover');
                    var date = $(this).datepicker('getDate');

                    that.searchDate(date);
                    that.selectCurrentWeek();

                    if (!that.$toggle_bar.is(":visible")) {

                        that.$week_picker_large.hide();

                    }

                },
                beforeShowDay: function(date) {

                    var cssClass = '';

                    if (date >= that.date.start && date <= that.date.end) {
                        cssClass = 'ui-datepicker-current-day';
                    }

                    return [true, cssClass];

                },
                onChangeMonthYear: function(year, month, inst) {
                    event.stopPropagation();
                    that.selectCurrentWeek();

                }
            });


        })(this);

        var today = new Date();
        this.$week_pickers.datepicker('setDate', today);
        this.searchDate(today);

        this.$week_pickers.find('.ui-datepicker-calendar tr').on('mouseover', function(e) {

            $(this).find('td a').addClass('ui-state-hover');
            e.stopPropagation();

        });

        this.$week_pickers.find('.ui-datepicker-calendar tr').on('mouseleave', function(e) {

            $(this).find('td a').removeClass('ui-state-hover');
            e.stopPropagation();
        });
    },

    searchDate: function(date) {
        var year = date.getFullYear(),
            month = date.getMonth(),
            dayStart = date.getDate() - date.getDay(),
            dayEnd = date.getDate() - date.getDay() + 6,
            dateFormat = $.datepicker._defaults.dateFormat,
            formattedStartDate = parseInt(year.toString() + this.pad(month + 1, 2) + this.pad(dayStart, 2)),
            formattedEndDate = parseInt(year.toString() + this.pad(month + 1, 2) + this.pad(dayEnd, 2));

        this.date.start = new Date(year, month, dayStart);
        this.date.end = new Date(year, month, dayEnd);

        this.$start_date.text($.datepicker.formatDate(dateFormat, this.date.start));

        this.$end_date.text($.datepicker.formatDate(dateFormat, this.date.end));

        if (!Backbone.pubSub) {
            (function(that) {
                setTimeout(function() {
                    that.searchBetweenDates(formattedStartDate, formattedEndDate);
                }, 25);
            })(this);
        } else {
            this.searchBetweenDates(formattedStartDate, formattedEndDate);
        }
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

    onSearch: function(e) {
        app.filters = app.filters || {};
        app.filters.text= {
                val: this.$search.val()
            };

        Backbone.pubSub.trigger('search',app.filters);
    },
    onSelectDateClick: function(e) {
        if ($(e.currentTarget).hasClass('large')) {
            this.$week_picker_large.show();
            e.stopPropagation();
            (function(that) {
                $('body').on('click', function(e) {
                    if (that.$week_picker_large.is(':visible')) {
                        that.$week_picker_large.hide();
                    }
                    $('body').off();
                });
            })(this);
        }
    },
    onClearClick: function(e) {
        this.$start_date.text('--/--/----');
        this.$end_date.text('--/--/----');
        app.filters.between = false;

        Backbone.pubSub.trigger('search', app.filters);
        this.selectNone();

    },
    onDateLabelClick: function(e) {
        this.$toggle_bar.click();
    },
    selectCurrentWeek: function() {

        (function(that) {
            setTimeout(function() {

                that.$week_pickers.find('.ui-datepicker-current-day a').addClass('ui-state-active');

            }, 1);

        })(this);
    },
    selectNone: function() {
        (function(that) {
            setTimeout(function() {

                that.$week_pickers.find('.ui-datepicker-current-day a').removeClass('ui-state-active');

            }, 1);

        })(this);
    }

});
