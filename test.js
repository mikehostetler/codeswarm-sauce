var async   = require('async');
var request = require('request').defaults({ jar: false });

module.exports = test;

///TestRunner.prototype.runTest = function(browsers, url, framework, tunnelIdentifier, testname, tags, build, callback){


function test(build, stage, config, context) {

  if (! config.urls) return stage.error(new Error('Need config.urls'));

  var tunnel = context.sauce && context.sauce.tunnel;
  if (! tunnel) return stage.error(new Error('No tunnel is set up'));

  var framework = config.framework;
  if (! framework) return stage.error(new Error('Need config.framework'));

  var urls = config.urls.split('\n').map(trim);

  var browsers = config.browsers;
  if (! browsers) return stage.error(new Error('Need config.browsers'));
  var platforms = parsePlatforms(browsers);

  async.parallel(urls, testOneUrl, done);

  function testOneUrl(url, cb) {

    var requestParams = {
      method: 'post',
      url: url,
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

    request(requestParams, function(error, response, body) {

      if (error) return cb(err);
      var results = body['js tests'];

      if (! results || ! results.length){
        return cb(new Error('Error starting tests in Sauce labs: ' + JSON.stringify(body)));
      }

      cb(null, results);

    });
  }

  function done(err) {
    if (err) stage.error(err);
    stage.end();
  }

};

/// Misc

function testName(build) {
  return 'Testing ' + build.project + ', branch ' + build.branch + ', commit ' + build.commit;
}

function trim(s) {
  return s.trim();
}

function parsePlatforms(browsers){
  return browsers.map(function(browser){
    return browser.split('-');
  });
};
