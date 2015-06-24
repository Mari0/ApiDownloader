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
