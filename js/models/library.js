var app = app || {};

app.Library = Backbone.Collection.extend({
    model: app.Item,
    comparator: function(property) {
        return selectedStrategy.apply(myModel.get(property));
    },
    strategies: {
        created: function(item) {
            return -item.get("created");
        }
    },
    changeSort: function(sortProperty) {
        this.comparator = this.strategies[sortProperty];
        this.trigger('sortList');
    },
    initialize: function() {
        this.changeSort("created");
    },
    //searches through a collection on multiple queries
    search: function(options) {
        var query_key, key, attributes,
            start, end, val, formatAttrFunc,
            queries = options,
            results = this,
            i;


        for (query_key in queries) {
            switch (query_key) {
                case 'text':
                    for (i = 0; i < queries[query_key].length; i++) {
                        val = queries[query_key][i].val.toLowerCase();
                        if (val.length == 0) {
                            continue;
                        }
                        attribute = queries[query_key][i].attribute;
                        results = results.filter(function(model) {
                            if (attribute && model.get(attribute)) {
                                if (model.get(attribute).toLowerCase().indexOf(val) > -1) {
                                    return true;
                                }
                            } else {
                                //search through all attributes
                                //if one matches, return true
                                //else, return false
                                attributes = model.attributes;
                                for (key in attributes) {
                                    if (attributes[key].toString().toLowerCase().indexOf(val) > -1) {
                                        return true;
                                    }
                                }
                                return false;
                            }
                        });
                    }
                    break;
                case 'between':
                    if (!queries[query_key]) {
                        continue;
                    }
                    start = queries[query_key].start;
                    end = queries[query_key].end;
                    attribute = queries[query_key].attribute;
                    formatAttrFunc = queries[query_key].formatAttrFunc;
                    if (formatAttrFunc) {
                        start = formatAttrFunc(start);
                        end = formatAttrFunc(end);
                    }
                    results = results.filter(function(model) {
                        val = formatAttrFunc ? formatAttrFunc(model.attributes[attribute]) : model.attributes[attribute];
                        if (start > 0 && !end) {
                            if (val >= start) {
                                return true;
                            }
                        } else if (!start && end > 0) {
                            if (val <= end) {
                                return true;
                            }
                        } else if (start > 0 && end > 0) {
                            if (val >= start && val <= end) {
                                return true;
                            }
                        } else {
                            return true;
                        }
                    });
                    break;
                default:
                    break;
            }
        }

        return new Backbone.Collection(results.models ? results.models : results);

    }
});
