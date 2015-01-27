var app = app || {};
app.fetchingData = false;
app.dataLoadCallback = false;
app.filterOptions = false;
app.filters = {};

app.property_map = {
	ows_department : 'department',
	ows_description : 'description',
	ows_id : 'id',
	ows_modified : 'modified',
	ows_created : 'created',
	ows_date : 'date'
}

app.config_map = {
	url: '',
	guid: ''
}

app.processResults = function(results){
		var temp_results = app.spData.processData(results);
			results = [], index = 0;

			for(var i = 0; i < temp_results.length; i++){
				if(Object.keys(temp_results[i]).length == 0){
					continue;
				}

				results.push({});
				index = results.length - 1;

				//make all keys lower case
				for (var key in temp_results[i]){
					if (app.property_map.hasOwnProperty(key.toLowerCase())){
						value = temp_results[i][key];
						key = app.property_map[key.toLowerCase()];
						results[index][key] = value;
					}
				}
			}
			return results;
}

app.getData = function(){
		app.LibraryCollection = app.LibraryCollection || new app.Library([]);
		app.fetchingData = true;
		app.spData.getData([{
			url: app.config_map.url,
			type: 'list',
			guid: app.config_map.guid,
			callback: function(results){
				app.fetchingData = false;
				results = app.processResults(results);
				//set library to results
				app.LibraryCollection.set(results);
				app.LibraryCollection.trigger('change');
				if(app.dataLoadCallback){
					app.dataLoadCallback();
					app.dataLoadCallback = false;
				}
				
			}

		}], 0, function(){
			console.log('data retrieved.');
		});
}

	
    



if(app.testing){
		app.LibraryCollection = new app.Library(data);
	} else {
		app.getData();
}