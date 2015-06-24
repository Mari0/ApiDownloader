//example
var fs = require('fs');
var request = require('request');


var Downloader = require('./../dist/ApiDownloader.js').Downloader;
var ApiWrapperSettings = require('./../dist/ApiDownloader.js').ApiWrapperSettings;

var api = JSON.parse(fs.readFileSync('./../api/Zipopotam.json'));
var settings = new ApiWrapperSettings(api, 'german_zip', null, null, null, null);

var zipList = [50667, 52074,14165,60313,44137,45131,45138,30169];


//Every 5 seconds 2 requests
Downloader(settings, zipList, 2, '*/5 * * * * *', function (meta, data) {
	console.log(meta.Id);
    postDocumentToArangoCollection('wrapper_test', data.root_data);
},
	function () {
	console.log('Cron Downloader Job is finished!');
});

var postDocumentToArangoCollection = function (collectionName, document) {
	request.post(
		'http://localhost:8529/_api/document?collection=' + collectionName + '&createCollection=true', {
		body : document
	},
		function (error, response, body) {
		if (error) {
			console.log(body)
		}
	});
};

