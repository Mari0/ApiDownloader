/** @module ApiWrapper */

var Done = function (meta, callback) {
	setTimeout(function () {
		var done = false;
		if (meta.Requests.length < meta.amountOfRequest) {
			Done(meta, callback);
			return;
		}
		callback();
	}, 1000);
};

/**
 * the main function of the ApiWrapper, also provides a CLI.
 * @example
 * RunApiWrapper(settings, function (meta, data) {
 *	console.log(JSON.stringify(meta, null, 4));
 *	console.log(data);
 *});
@example
 * Command Pattern-  node  <javascript.js> --(n | a | f) pathToApiConfig endpoint identifier --reqParam:paramName1=value1;paramName2=value2;.... --optParam:paramName1=value1;paramName2=value2;.... --out:outputPath
 * node <javascript.js> notReal_api.json entity2 --reqParam:moreUserInput=moreBlubb --optParam:optUserIn1=blubbi&optUserIn2=blubbi2 -out:./test_data/test
@class
 * @param settings {ApiWrapperSettings} - the settings of the api wrapper
 * @param callback {RunApiWrapper.callback} - the callback of provides the meta information and the data
 */
exports.RunApiWrapper = function (settings, callback) {
	var fs = require('fs');

	var fetchResult = function (url, callback) {
		var http = null;
		if (url.indexOf('https') != -1)
			http = require('https');
		else
			http = require('http');

		var bodyarr = [];
		http.get(url, function (res) {
			res.on('data', function (chunk) {
				bodyarr.push(chunk);
			});
			res.on('end', function () {
				callback(bodyarr.join('').toString(), res.statusCode);
			});
		}).on('error', function (e) {
			callback(e.message);
		});
	};

	var meta = {};
	var params = null;
	var apiSettings = new ApiWrapperSettings();
	var fileNameExt = '';

	//meta.settings = settings;
	apiSettings = settings;
	if (settings.api) {
		if (settings.endpoint) {
			if (apiSettings.api.endpoints[apiSettings.endpoint].identifier) {
				if (!apiSettings.identifier) {
					return new Error('Identifier is missing');
				} else
					meta.Id = apiSettings.identifier;
			} else
				fileNameExt = settings.identifier;
		} else
			return new Error('Error:No Endpoint defined!');
	} else
		return new Error('no API defined!');

	var wrapper = new ApiWrapper(apiSettings);
	var root_req = wrapper.GenerateEndpointReq();
	if (!root_req) {
		console.error('no valid request');
		return;
	}
	var dataStore = {};

	var requests = [];
	meta.Requests = requests;

	var amountOfRequest = 1;
	meta.amountOfRequest = amountOfRequest;

	if (apiSettings.options.indexOf('n') == -1) {
		fetchResult(root_req, function (res, code) {
			var falsyConditions = [];
			var obj2 = null;
			try {
				obj2 = JSON.parse(res, 'utf8');
			} catch (e) {
				callback(meta, {
					error : true,
					error_msg : 'error:parsing to json failed!',
					data : res
				});
				return;
			}
			var data = JSON.stringify(obj2);
			requests.push({
				'req' : root_req,
				'status' : code
			});
			dataStore['root_data'] = data;
			if (apiSettings.api.endpoints[apiSettings.endpoint].additionalRequest) {
				apiSettings.api.endpoints[apiSettings.endpoint].additionalRequest.forEach(function (val, index) {
					var add_req = wrapper.GetAdditionalReq(obj2, val);
					if (add_req) {
						//console.log('Making Request...' + add_req);
						meta.amountOfRequest = ++amountOfRequest;
						//make addiontional requests
						if (apiSettings.options.indexOf('a') == -1) {
							fetchResult(add_req, function (data, addReq_code) {
								try {
									var subDoc = JSON.parse(data, 'utf-8');
									dataStore[val.name] = JSON.stringify(subDoc);
									requests.push({
										'req' : add_req,
										'status' : addReq_code,
										'name' : val.name
									});
								} catch (e) {
									dataStore[val.name] = JSON.stringify({
											error : true,
											error_msg : 'ERROR: parsing to json failed!',
											status : addReq_code,
											data : data
										});
									requests.push({
										'req' : add_req,
										'status' : addReq_code,
										'name' : val.name,
										'error' : true
									});
								}
							});
						} else
							requests.push({
								'req' : add_req,
								'status' : 'not requested',
								'name' : val.name
							});
					} else
						falsyConditions.push(val.name);
				});
			}
			meta.falsyConditions = falsyConditions;

			if (apiSettings.options.indexOf('a') == -1) {
				Done(meta, function () {
					if (callback)
						callback(meta, dataStore);
				});
			} else {
				if (callback)
					callback(meta, dataStore);
			}

		});
	} else {
		console.log('Http Request deactivated!!');
		requests.push({
			'req' : root_req,
			'status' : 'not requested'
		});
		if (callback)
			callback(meta);
	}
};


/**
 * After the ApiWrapper finishes the callback is called to provide meta information and data.
 *@callback RunApiWrapper.callback
 *@param meta - the meta information about the http requests
 *@param data - the content of the http request
*/
