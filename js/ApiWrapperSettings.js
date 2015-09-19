/**
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
    if (!opts) {
        this.options = '';
    }
    else {
        /** the options of the ApiWrapper. Options can be -n no http-request, -a no additional http-request -f write result to file. file is specified in the outputFolder */
        this.options = opts;
    }
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
exports.ApiWrapperSettings = ApiWrapperSettings;