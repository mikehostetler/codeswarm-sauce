var async   = require('async');
var request = require('request').defaults({ jar: false });
var resultParsers = require('./result_parsers');

var STATUS_POLLING_INTERVAL_MS = 5000;

module.exports = test;

///TestRunner.prototype.runTest = function(browsers, url, framework, tunnelIdentifier, testname, tags, build, callback){


function test(build, stage, config, context) {

  if (! config.files) return stage.error(new Error('Need config.files'));

  var tunnel = context.sauce && context.sauce.tunnel;
  if (! tunnel) return stage.error(new Error('No tunnel is set up'));

  var framework = config.framework;
  if (! framework) return stage.error(new Error('Need config.framework'));

  var urls = config.files.split('\n').map(trim).map(fileToURL);

  var browsers = config.browsers;
  if (! browsers) return stage.error(new Error('Need config.browsers'));
  var platforms = parsePlatforms(browsers);

  async.map(urls, testOneUrl, done);

  function testOneUrl(url, cb) {

    var requestParams = {
      method: 'post',
      url: 'https://saucelabs.com/rest/v1/' + config.sauce_username + '/js-tests',
      auth: {
        user: config.sauce_username,
        pass: config.sauce_access_key
      },
      json: true,
      body: {
        platforms: platforms,
        url: url,
        framework: framework,
        name: testName(build),
        tags: ['codeswarm', build.project],
        build: build._id,
        tunnel: tunnel.identifier
      }
    };

    request(requestParams, function(err, response, body) {

      if (err) return cb(err);
      var testIds = body['js tests'];

      if (! testIds || ! testIds.length){
        return cb(new Error('Error starting tests in Sauce labs: ' + JSON.stringify(body)));
      }

      async.map(testIds, checkStatus, cb);

    });

    function checkStatus(testId, cb) {
       var requestParams = {
         method: 'post',
         url: 'https://saucelabs.com/rest/v1/' + config.sauce_username + '/js-tests/status',
         auth: {
           user: config.sauce_username,
           pass: config.sauce_access_key
         },
         json: true,
         body: {
           "js tests": [testId],
         }
       };

       _checkStatus();

       function _checkStatus() {
        request(requestParams, replied);

        function replied(err, res, body) {
          console.log('STATUS REPLY:', err, body);
          if (err) return cb(err);
          var results = body['js tests'];

          if (results && results[0] && results[0].status == 'test error')
            return cb(new Error('Sauce Labs test error'));

          if (! body.completed) {
            /// call me later
            setTimeout(_checkStatus, STATUS_POLLING_INTERVAL_MS);
          } else {
            cb(null, [0]);
          }
        }
       }
    }
  }

  function done(err, results) {
    if (err) stage.error(err);

    /// TODO: detect test errors in results
    stage.end(results);
  }

};

/// Misc

function testName(build) {
  return 'Testing ' + build.project + ', branch ' + build.branch + ', commit ' + build.commit;
}

function trim(s) {
  return s.trim();
}

function fileToURL(file) {
  if (file.charAt(0) != '/') file = '/' + file;
  return 'http://localhost:8080' + file;
}

function parsePlatforms(browsers){
  return browsers.map(function(browser){
    return browser.split('-');
  });
};
