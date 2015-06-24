var runWrapper = require('./../dist/ApiDownloader.min.js').RunApiWrapper;
var ApiWrapperSettings = require('./../dist/ApiDownloader.min.js').ApiWrapperSettings;
var fs = require('fs');

var api = JSON.parse(fs.readFileSync('./../api/Zipopotam.json'));
var settings = new ApiWrapperSettings(api, 'german_zip', '50667', null, null, null, null);

runWrapper(settings, function (res, data) {
	console.log(JSON.stringify(res, null, 4));
	console.log(data);
});
