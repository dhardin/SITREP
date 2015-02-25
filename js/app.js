var app = app || {};
app.fetchingData = app.fetchingData || false;
app.dataLoadCallback = app.dataLoadCallback || [];
app.filterOptions = app.filterOptions || false;
app.filters = app.filters || {};
app.testing = true;
app.state_map = {
    fetched: false
};


app.processResults = function(results) {
    var temp_results = app.spData.processData(results);
    results = [], index = 0;

    for (var i = 0; i < temp_results.length; i++) {
        if (Object.keys(temp_results[i]).length == 0) {
            continue;
        }

        results.push({});
        index = results.length - 1;

        //make all keys lower case
        for (var key in temp_results[i]) {
            if (app.property_map.hasOwnProperty(key.toLowerCase())) {
                value = temp_results[i][key];
                key = app.property_map[key.toLowerCase()];
                results[index][key] = value;
            }
        }
    }
    return results;
}

app.getData = function() {
    var i;
    app.LibraryCollection = app.LibraryCollection || new app.Library([]);
    app.fetchingData = true;
    if (!app.testing) {
        app.spData.getData([{
            url: app.config_map.url,
            type: 'list',
            guid: app.config_map.guid,
            callback: function(results) {
                app.fetchingData = false;
                results = app.processResults(results);
                //set library to results
                app.LibraryCollection.set(results);
                app.LibraryCollection.trigger('change');
                if (app.dataLoadCallback) {
                    for (i = 0; i < app.dataLoadCallback.length; i++) {
                        app.dataLoadCallback[i]();
                    }
                    app.dataLoadCallback = false;
                }
            }
        }], 0, function() {
            app.state_map.fetched = true;
        });
    } else {
        //simulate server fetch
        setTimeout(function() {
            app.fetchingData = false;
            results = app.test_data || [];
            app.LibraryCollection.set(results);
            app.LibraryCollection.trigger('change');
            if (app.dataLoadCallback) {
                for (i = 0; i < app.dataLoadCallback.length; i++) {
                    app.dataLoadCallback[i]();
                }
                app.dataLoadCallback = false;
            }
        }, 100);
    }
}






