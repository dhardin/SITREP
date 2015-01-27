//our data module allows us to take in an array of objects 
//which will each reference a list and view GUID.
//
//The module processes each object linearly and then
//returns the results which is stored in the object.
//
//When a result is returned, a callback function is called on the result
//and each callback is also stored in the calling object.  This allows for us to
//process the results asynchronously.
//
var app = app || {};

app.spData = (function(){
	var stateMap = {
		dataArr: [],
		currentDataArrIndex: 0
	},
	getData, _getListItems, processData;

	getData = function(dataArr, index, callback){
		var url, guid, viewName, type, dataCallback;

		if(!dataArr instanceof Array){
			return;
		}
		if (index > dataArr.length){
			return;
		}

		//get options for current index
        url = dataArr[index].url;
        //data calls assume url ends with '/'
        //fix url if it dosn't end with '/'
        if(!url.endsWith('/')){
            url = url + '/';
        }

		guid = dataArr[index].guid;
		type = dataArr[index].type;
		dataCallback = dataArr[index].callback;

		stateMap.dataArr = dataArr;
		stateMap.currentDataArrIndex = index || 0;

		_getListItems(url, guid, type, function (results) {
			if (dataCallback){
				dataCallback(results);
			}
			if (index < dataArr.length - 1) {
                getData(dataArr, ++index, callback);
            } else if(index == dataArr.length){
				if(callback){
					callback();
				}
			} 
		})

	};

	 // Begin Utility Method /_getListItems/
    _getListItems = function (url, guid, type, callback) {
        var results = [], soapEnv, body;


        soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\
                <soap:Body>\
                    <GetListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">\
                        <listName>'+guid+'</listName>\
                    </GetListItems>\
                </soap:Body>\
            </soap:Envelope>';



        $.ajax({
            url: url + "_vti_bin/lists.asmx",
            beforeSend: function (xhr) {
                xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/GetListItems');
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            tryCount: 3,
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                printError(XMLHttpRequest, textStatus, errorThrown)
                this.tryCount++;
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                } else if (callback) {
                    callback(textStatus);
                }
            },
            complete: function (xData, status) {
                var responseProperty = (xData.responseText ? 'responseText' : 'responseXML'),
                 results = $(xData[responseProperty]).find('z\\:row');

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /_getListItems/

    // Begin Utility Method /saveData/
    saveData = function(dataObjArr, type){
        var url = dataObjArr.url,
        data = dataObjArr.data,
        guid = dataObjArr.guid,
        callback = dataObjArr.callback,
        method = dataObjArr.method;

         _buildPayload(data, 0, {}, method, '', function (results) {
                _saveListItem(url, guid, results, function(results){
                    if(callback){
                        callback(results);
                    }
                    
                });
            });
    }
    // End Utility Method /saveData/


     // Begin Utility Method /_saveListItem/
    _saveListItem = function (url, guid, payload, callback) {
        var results = [],
            
        // Create the SOAP request
         soapEnv =
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
                + '<soap:Body>'
                    + '<UpdateListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">'
                    + '<listName>' + guid + '</listName>'
                    + '<updates>'
                        + '<Batch OnError="Continue" PreCalc="True">'
                            + payload
                        + '</Batch>'
                    + '</updates>'
                    + '</UpdateListItems>'
                + '</soap:Body>'
            + '</soap:Envelope>';

        $.ajax({
            url: url + "/_vti_bin/lists.asmx",
            beforeSend: function(xhr){
                xhr.setRequestHeader('SOAPAction', 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems');
            },
            type: "POST",
            dataType: "xml",
            data: soapEnv,
            error: printError,
            complete:  function(xData, status){
                $(xData.responseText).find("rows").each(function () {
                    var $this = $(this)[0],
                    title, url;

                    title = $this.title;
                    url = $this.getAttribute('url');
                    results.push({ title: title, url: url, type: 'web' });
                });

                if (callback) {
                    callback(results);
                }
            },
            contentType: "text/xml; charset=\"utf-8\""
        });
    };
    // End Utility Method /saveListItem/


    // Begin Utility Method /_buildPayload/
    _buildPayload = function (arr, index, obj_map, method, payload, callback) {
        var i,
            method_map = {
                'new': true,
                'update': true,
                'delete': true
            },
            fileName, fieldValue, key, fieldPayload = "";

        payload = payload || "";

        if (!(arr instanceof Array) 
            || !(obj_map instanceof Object)
            || !(method_map.hasOwnProperty(method.toLowerCase()))
            ){
            return false;
        }

        if(index < arr.length){
            for (key in arr[index]) {
                fieldName = key;
                fieldValue = arr[index][key];
                fieldPayload += '<Field Name="' + fieldName + '">' + fieldValue + '</Field>';
            }

            
            payload += '<Method ID="' + (index + 1) + '" Cmd="' + method + '">' + (method.toLowerCase() == 'new' ? '<Field Name="ID">New</Field>' : '') + fieldPayload + '</Method>';
            index++;

            setTimeout(function () {
                _buildPayload(arr, index, obj_map, method, payload, callback);
            }, 10);

        } else if (callback) {
            callback(payload);
            return payload;
        } else {
            return payload;
        }

   
    };
    // End Utility Method /_buildPayload/


    printError = function(XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest + '\n\n' + textStatus + '\n\n' + errorThrown);
    };

    // Begin Utility Method /processData/
     processData = function(results) {
        var data = [{}],
            attrObj = {},
            i, j, attribute,
            chart = this.model;


        //repackage data into an array which each index
        //is an object with key value pairs
        for (i = 0; i < results.length; i++){
            attrObj = {};
            if(!results[i].attributes){
                continue;
            }
            for (j = 0; j < results[i].attributes.length; j++){
                attribute = results[i].attributes[j];
                attrObj[attribute.name] = attribute.value;
            }
            data.push(attrObj);
        }

        return data;
    };
   // End Utility Method /processData/

	return {
		getData: getData,
        saveData: saveData,
        processData: processData
	};
})();

String.prototype.endsWith = function(suffix){
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
}