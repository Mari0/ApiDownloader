/** @module ApiDownloader */
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
	if (!requestsProJob || requestsProJob < 1) {
        requestsProJob = IdList.length;
    }
	new CronJob(cronPattern, function () {
		for (var i = 0; i < requestsProJob && counter < IdList.length; i++) {
			ApiSettings.identifier = IdList[counter];

            var error =  (function(){
                return runWrapper(ApiSettings, function (meta, data) {
                    onDownload(meta, data);
                });
            })();

            if (error) {
                if (error.constructor.name === 'Error') {
                    console.log(error);
                }
			}
			counter++;
			if (counter === IdList.length) {
                this.stop();
            }
		}
	}, onComplete, true);
};
/**
 * A simpler version of the Downloader
 * @param ReqList the request list can be a array or an object
 * @param propertyValueOfUrl if the request list is a object the property name of the url
 * @param requestsProJob the request pro job
 * @param cronPattern the cron pattern
 * @param onDownload callback on each download
 * @param onComplete callback when the cron job terminates
 * @constructor
 */
exports.SimpleDownloader = function (ReqList, propertyValueOfUrl, requestsProJob, cronPattern, onDownload, onComplete) {
	var CronJob = require('cron').CronJob;
	var request = require('request');
	var Q = require('q');

	var makeReq = function (req, propertyValueOfUrl) {
		var defered = Q.defer();
		var url = null;
		if (req.constructor.name === 'Object' && propertyValueOfUrl) {
            url = req[propertyValueOfUrl];
        }
		else {
            url = req;
        }
		request.get(url, function (error, response, body) {
			defered.resolve({body:body, meta:req});
		});
		return defered.promise;
	};

	var counter = 0;
	if (!requestsProJob || requestsProJob < 1) {
        requestsProJob = ReqList.length;
    }
	new CronJob(cronPattern, function () {
		for (var i = 0; i < requestsProJob && counter < ReqList.length; i++) {
			makeReq(ReqList[counter],propertyValueOfUrl).then(function(data){
				onDownload(data.body, data.meta);
			});
			counter++;
			if (counter === ReqList.length) {
                this.stop();
            }
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
