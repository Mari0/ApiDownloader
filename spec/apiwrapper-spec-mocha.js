//mocha test mocha --timeout 15000 ./spec/apiwrapper-spec-mocha.js -R list
//run a single task mocha ./spec/apiwrapper-spec-mocha.js -g "Test 5"
var fs = require('fs');
var expect = require('expect');
var runWrapper = require('./../dist/ApiDownloader.min.js').RunApiWrapper;
var ApiWrapperSettings = require('./../dist/ApiDownloader.min.js').ApiWrapperSettings;
describe('API wrapper test', function () {
	it('Test  - CB API Test with option n', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/CrunchbaseV2_deprecated.json'));
		var settings = new ApiWrapperSettings(api, 'organization', 'facebook', null, null, 'n');
		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});
	it('Test - ZipLocation test no request', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/ZipLocate.json'));
		var settings = new ApiWrapperSettings(api, 'Zip', '50667', null, null, 'n');

		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});
	it('Test - ZipLocation test', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/ZipLocate.json'));
		var settings = new ApiWrapperSettings(api, 'Zip', '50667', null, null);
		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual(200);
		});
	});
	it('Test - AL startups_id test', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/Angellist.json'));
		var settings = new ApiWrapperSettings(api, 'startups_id', '6702', null, null, 'n');

		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});
	it('Test - AL users test', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/Angellist.json'));
		var settings = new ApiWrapperSettings(api, 'users', '9826', null, null, 'n');

		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});
	it('Test - AL startup roles with optional user id', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/Angellist.json'));
		var settings = new ApiWrapperSettings(api, 'startupRoles', null, null, 'user_id=9826', 'n');

		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});
	it('Test - AL startup roles with optional startup id', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/Angellist.json'));
		var settings = new ApiWrapperSettings(api, 'startupRoles', null, null, 'startup_id=6702', 'n');

		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});
	it('Test - AL startup roles with optional user and startup id', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/Angellist.json'));
		var settings = new ApiWrapperSettings(api, 'startupRoles', 'SID6702', null, 'user_id=9826;startup_id=6702', 'n');

		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});

	it('Test  - Al startup_comments', function (done) {
		var api = JSON.parse(fs.readFileSync('./configs/Angellist.json'));
		var settings = new ApiWrapperSettings(api, 'startups_comments', '6702', null, null, 'n');

		runWrapper(settings, function (res) {
			done();
			expect(res.Requests[0].status).toEqual('not requested');
		});
	});
});
