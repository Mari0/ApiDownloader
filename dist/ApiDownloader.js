/**
 @class
     The ApiWrapper-Main Class.
 @param apiSettings - the ApiWrapperSettings-Object.
 @throws throws an Expection 'No ApiWrapperSettings-object'
 */
function ApiWrapper(apiSettings) {
    if (apiSettings.constructor.name != 'ApiWrapperSettings')
        return new Error('No ApiWrapperSettings-object');
    var jsonPath = require('JSONPath');
    var settings = apiSettings;

    /** Generates the http-request for the endpoint specified in the ApiWrapperSettings-object*/
    this.GenerateEndpointReq = function () {

        var req = null;
        var endpointObj = settings.api.endpoints[settings.endpoint];
        if (endpointObj) {
            //replace the identifer if necessary
            var identifierPath = null;
            if (endpointObj.path.indexOf('{' + endpointObj.identifier + '}') != -1)
                identifierPath = endpointObj.path.replace('{' + endpointObj.identifier + '}', settings.identifier);
            else
                identifierPath = endpointObj.path;
            req = settings.api.basePath + identifierPath;
            //add additional parameters to the request
            //the parameter values are stored in param and they will be assigned numerically to the properties defined in the endpoint's parameters-array
            req = setParameters(req, endpointObj.required_parameters, settings.reqParam, true);
            //set optional parameters
            req = setParameters(req, endpointObj.optional_parameters, settings.optParam);
        }
        return req;
    };

    /** helper function for GenerateEndpointReq and GetAdditionalReq-function. Sets all optional and required-Parameters for a request.
     *The function is called 2 times. For the required and the optional parameters in GenerateEndpointReq and GetAdditionalReq.
     *@param request -the request to modify with the parameters
     *@param params - the parameters to set
     *@param paramsUser - the user input parameters
     *@param required - set true if the parameters are required for a vaild http-request
     *@return a http-request with all parameters*/
    var setParameters = function (request, params, paramsUser, required) {
        var userParam = formatUserParam(paramsUser);
        if (params) {
            if (request.indexOf('?') != -1)
                request += '&';
            else
                request += '?';
            var i = 0;
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    if (params[key] === '@apiKey')
                        request += key + '=' + settings.api.apiKey + '&';
                    else if (params[key] === '@user') {
                        if (userParam != null && userParam[key] != null)
                            request += key + '=' + userParam[key] + '&';
                        else {
                            if (required)
                                throw new Error('Request is not correct! Missing required parameters');
                        }
                    } else
                        request += key + '=' + params[key] + '&';
                }
            }
            request = request.slice(0, -1);
        }
        return request;
    };
    var formatUserParam = function (userParam) {
        //example:--reqParam:user_id=test1&startup_id=test2 or  --optParam:....
        if (userParam) {
            var result = {};
            var tmp = userParam.replace('--reqParam:', '').replace('--optParam:', '');
            var p = tmp.split(';');
            p.forEach(function (val, i) {
                var prop = val.split('=');
                result[prop[0]] = prop[1];
            });
            return result;
        }
    };
    /**
     * Generates additonal http-Request if definied in the enpoint of the ApiWrapper-config file.
     * Additional Request are extracted from the data with a json-path expression.
     * @param data - the data from main http-request
     * @param additionalReq - the additionalReq-object form the ApiWrapper-config
     * @return a http-Request */
    this.GetAdditionalReq = function (data, additionalReq) {
        var getRequest = false;
        if (additionalReq.request_condition) {
            if (resolveCondition(additionalReq.request_condition, data))
                getRequest = true;
        } else {
            getRequest = true;
        }
        if (getRequest) {
            var req = jsonPath.eval(data, additionalReq.jsonPath)[0];
            req = setParameters(req, additionalReq.required_parameters, null);
            req = setParameters(req, additionalReq.optional_parameters, null);
            return req;
        } else
            return null;
    };
    /**
     * resolves the condition of a additional request.
     * @param condition - the condition is a string, which should satisfy the following pattern json-path (>|=|>=|<|<=|!=) (number|string|boolean)
     * @param data - the data object to eval the jsonpath-expression
     * @return true if the condition is true
     * @example
     *"additionalRequest":[{
	 *	"name":"past_team",
	 *	"method":"GET",
	 *	"request_condition":"$.data.relationships.past_team.paging.total_items > 8",
	 *	"jsonPath":"$.data.relationships.past_team.paging.first_page_url",
	 *	"required_parameters":{
	 *	"user_key":"@apiKey"
     *	}
     *},
     *....]
     * this only evals the jsonPath-Property if the request_condition is true.
     */
    var resolveCondition = function (condition, data) {
        //try {
        if (condition.search(/\w\ (>|=|>=|<|<=|!=)\ \w/g) != -1) {
            var p = condition.split(/\ (>|=|>=|<|<=|!=)\ /g);
            var val1 = jsonPath.eval(data, p[0])[0];
            var val2 = parseInt(p[2]);
            if (typeof val2 != 'number')
                val2 = p[2];
            switch (condition.match(/(>|=|>=|<|<=|!=)/g)[0]) {
                case '>':
                    return val1 > val2;
                case '>=':
                    return val1 >= val2;
                case '<':
                    return val1 < val2;
                case '<=':
                    return val1 <= val2;
                case '=':
                    return val1 == val2;
                case '!=':
                    return val1 != val2;
            }
        }
        //} catch (e) {
        //	return false;
        //}
    };
}
exports.ApiWrapper = ApiWrapper;
;/**
 * @class
 * The ApiWrapperSettings-Class. This class provides all necessary settings for the ApiWrapper.
 * the property can be set as a parameter or can be accessed as public attributes
 * @param apiObj - equals to apiKey
 * @param ep - equal to endpoint
 * @param id - equal to identifer
 * @param req - equal to reqParam
 * @param opt - equal to optParam
 * @param opts - equal to options. options is set to the empty string, if opt is null
 * @see ApiWrapper
 */
function ApiWrapperSettings(apiObj, ep, id, req, opt, opts) {
    if (!opts)
        this.options = '';
    else
        /** the options of the ApiWrapper. Options can be -n no http-request, -a no additional http-request -f write result to file. file is specified in the outputFolder */
        this.options = opts;
    /**the json-object of the endpoint parsed form the ApiWrapper-config */
    this.api = apiObj;
    /** the endpoint of a API */
    this.endpoint = ep;
    /** the identifer of a endpoint*/
    this.identifier = id;
    /** the required parameters of the endpoint*/
    this.reqParam = req;
    /** the optional parameters of the endpoint*/
    this.optParam = opt;
}
exports.ApiWrapperSettings = ApiWrapperSettings;;/** @module ApiDownloader */
/**
 * @class
 * the Downloader is a Cron Job who takes an API-Configuration, an Cron Time Pattern and a Id-List as input and calls the APIWrapper
 * to download data.
 * 	{@link https://github.com/ncb000gt/node-cron}
 * @requires cron
 * @example
 * Cron Pattern Examples:
 * "0 0 * * * *" = the top of every hour of every day.\\
 * "* /10 * * * * *" = every ten seconds. NO SPACE between * /10
 * "0 0 8-10 * * *" = 8, 9 and 10 o'clock of every day.
 * "0 0/30 8-10 * * *" = 8:00, 8:30, 9:00, 9:30 and 10 o'clock every day.
 * "0 0 9-17 * * MON-FRI" = on the hour nine-to-five weekdays
 * "0 0 0 25 12 ?" = every Christmas Day at midnight
 *@param ApiSettings - the ApiWrapperSettings-Objects provides all Information about the API. The Identifier property gets overridden by the IdList.
 *@param IdList - the IdList of the API
 *@param  requestsProJob - amount of request pro job, if null it will Load everything at once
 *@param  cronPattern - see examples below
 *@param  onDownload - the method to run after the api wrapper is finished
 *@param  onComplete - the method to run after the cron job is finished, depending on the cronPattern.
 */
exports.Downloader = function (ApiSettings, IdList, requestsProJob, cronPattern, onDownload, onComplete) {
	var CronJob = require('cron').CronJob;
	var runWrapper = exports.RunApiWrapper;

	var counter = 0;
	if (!requestsProJob || requestsProJob < 1)
		requestsProJob = IdList.length;
	new CronJob(cronPattern, function () {
		for (var i = 0; i < requestsProJob && counter < IdList.length; i++) {
			ApiSettings.identifier = IdList[counter];
			var error = runWrapper(ApiSettings, function (meta, data) {
					onDownload(meta, data);
				});
			if (error) {
				if (error.constructor.name === 'Error')
					console.log(error);
			}
			counter++;
			if (counter == IdList.length)
				this.stop();
		}
	}, onComplete, true);
};

exports.SimpleDownloader = function (ReqList, propertyValueOfUrl, requestsProJob, cronPattern, onDownload, onComplete) {
	var CronJob = require('cron').CronJob;
	var request = require('request');
	var Q = require('q');

	var makeReq = function (req, propertyValueOfUrl) {
		var defered = Q.defer();
		var url = null;
		if (req.constructor.name === 'Object' && propertyValueOfUrl)
			url = req[propertyValueOfUrl];
		else
			url = req;
		request.get(url, function (error, response, body) {
			defered.resolve({body:body, meta:req});
		});
		return defered.promise;
	};

	var counter = 0;
	if (!requestsProJob || requestsProJob < 1)
		requestsProJob = ReqList.length;
	new CronJob(cronPattern, function () {
		for (var i = 0; i < requestsProJob && counter < ReqList.length; i++) {
			makeReq(ReqList[counter],propertyValueOfUrl).then(function(data){
				onDownload(data.body, data.meta);
			});
			counter++;
			if (counter == ReqList.length)
				this.stop();
		}
	}, onComplete, true);
};
/**
 * @class
 * the Shedule starts a the Downloader according to a certain cron pattern.
 * Make sure the Downloader Job finishes before the next tick of the sheduler start
 * @see Downloader
 * @param cronPattern - the cron pattern of the sheduler
 * @param onSheduleComplete - callback if the sheduler is done
 * @param Downloader -the Downloader-function to call
 * @param api - the ApiWrapperSettings-Objects. All following pramaters and this one are equal to the Downloader - Function
 * @param idList - the IdList of the API
 * @param  requestsProJob - amount of request pro job, if null it will Load everything at once
 *@param  cronDownloaderPattern - see examples below
 *@param  onDownload - the method to run after the api wrapper is finished
 *@param  onComplete - the method to run after the cron job is finished, depending on the cronPattern.

 */
exports.Shedule = function (cronPattern, onSheduleComplete, Downloader, api, idList, requestsProJob, cronDownloaderPattern, onDownload, onComplete) {
	var CronJob = require('cron').CronJob;
	new CronJob(cronPattern, function () {
		Downloader(api, idList, requestsProJob, cronDownloaderPattern, onDownload, onComplete);
	}, onSheduleComplete, true);
};
;/** @module ApiWrapper */

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
