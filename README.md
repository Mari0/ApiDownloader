# ApiDownloader
[![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
[![Codacy Badge](https://api.codacy.com/project/badge/c2a19ac85eea4d8aa19726d0dd9e6d33)](https://www.codacy.com/app/mario-rosenstengel/ApiDownloader)

My first little nodejs project. It is a simple Wrapper for HTTP REST API's.
The API's are defined as JSON, some small examples are located in the configs-folder.
This little app allows to generate and make HTTP requests according to the endpoints defined in a API.
Additionally it is possible to time the requests with [CronJobs](https://github.com/ncb000gt/node-cron) with the downloader-module.

### Install & Building
* Run ```npm install``` to install the dependencies
* Run ```grunt build-min``` to build the app.

### Test
To get familiar with testing frameworks i created tests with jasmine and mocha.

* Run ```grunt jasmine``` or  ```grunt mocha``` to run the test.
