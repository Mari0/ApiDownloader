var fs = require('fs');
var ApiWrapper = require('./../dist/ApiDownloader.js').ApiWrapper;
var ApiWrapperSettings = require('./../dist/ApiDownloader.js').ApiWrapperSettings;
describe('GenerateEndpointReq Test for ApiWrapper-Class with Crunchbase API', function () {
	var settings = new ApiWrapperSettings();
	settings.api = JSON.parse(fs.readFileSync('./configs/CrunchbaseV2_deprecated.json', 'utf8'));
	it('Test 1 - CB API organization/{permalink} with 1 parameter ', function () {
		settings.endpoint = 'organization';
		settings.identifier = 'arangodb';
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('https://api.crunchbase.com/v/2/organization/arangodb?user_key=<%- key %>');
	});

	it('Test 2 - CB API organizations with 2 optional params', function () {
		settings.endpoint = 'organizations';
		settings.optParam = '--optParam:order=created_at+DESC;page=1';
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('https://api.crunchbase.com/v/2/organizations?user_key=<%- key %>&page=1&order=created_at+DESC');
	});

	it('Test 3 - CB API organizations with 1 optional param', function () {
		settings.endpoint = 'organizations';
		settings.optParam = '--optParam:order=created_at+DESC';
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('https://api.crunchbase.com/v/2/organizations?user_key=<%- key %>&order=created_at+DESC');
	});
	it('Test 4 - CB API organizations without optional parameters', function () {
		settings.endpoint = 'organizations';
		settings.optParam = null;
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('https://api.crunchbase.com/v/2/organizations?user_key=<%- key %>');
	});
});

describe('GenerateEndpointReq Test for ApiWrapper-Class wit Not Real API', function () {
	var settings = new ApiWrapperSettings();
	settings.api = JSON.parse(fs.readFileSync('./configs/TestApi.json', 'utf8'));
	it('Test1 - Enitity1 with all Parameters', function () {
		settings.endpoint = 'entity1';
		settings.identifier = 123;
		settings.reqParam = '--reqParam:userInput=Blubb';
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('http://notreal.com/api/entity1/123?access_key=123456789&constant=constantlyRequired&userInput=Blubb');
	});
	it('Test2 - Entity1 with missing required Pramater. Throws Error!', function () {
		settings.endpoint = 'entity1';
		settings.identifier = 123;
		settings.reqParam = null;
		var wrapper = new ApiWrapper(settings);
		expect(function () {
			wrapper.GenerateEndpointReq();
		}).toThrow(new Error('Request is not correct! Missing required parameters'));
	});
	it('Test3 - Entity2 with all optional Parameters', function () {
		settings.endpoint = 'entity2';
		settings.reqParam = '--reqParam:moreUserInput=blubbi';
		settings.optParam = '--optParam:optUserIn1=something;optUserIn2=something+else';
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('http://notreal.com/api/entity2?user_key=123456789&constant1=constantlyRequired1&constant2=constantlyRequired2&moreUserInput=blubbi&optUserIn1=something&optUserIn2=something+else');
	});
	it('Test4 - Entity2 with no optional parameters', function () {
		settings.endpoint = 'entity2';
		settings.reqParam = '--reqParam:moreUserInput=blubbi';
		settings.optParam = null;
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('http://notreal.com/api/entity2?user_key=123456789&constant1=constantlyRequired1&constant2=constantlyRequired2&moreUserInput=blubbi');
	});
	it('Test5 - Entity 2 with one optional parameter', function () {
		settings.endpoint = 'entity2';
		settings.reqParam = '--reqParam:moreUserInput=blubbi';
		settings.optParam = '--optParam:optUserIn1=something';
		var wrapper = new ApiWrapper(settings);
		var req = wrapper.GenerateEndpointReq();
		expect(req).toEqual('http://notreal.com/api/entity2?user_key=123456789&constant1=constantlyRequired1&constant2=constantlyRequired2&moreUserInput=blubbi&optUserIn1=something');
	});
});