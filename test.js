var async   = require('async');
var wd      = require('wd');
var resultParsers = require('./result_parsers');

var TEST_TIMEOUT_SECS = 60 * 45; // 45 minutes
var POLL_FREQ_MS = 10 * 1000; // 10 seconds

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
  if (! Array.isArray(browsers)) browsers = [browsers];
  var platforms = parsePlatforms(browsers);

  async.map(urls, testOneUrl, done);

  function testOneUrl(url, cb) {
    async.map(platforms, testOneUrlOneBrowser.bind(null, url), cb);
  }

  function testOneUrlOneBrowser(url, browser, cb) {
    var worker = wd.remote(
      "ondemand.saucelabs.com",
      80,
      config.sauce_username,
      config.sauce_access_key);

    worker.done = false;

    worker.init({
      browserName: browser.name,
      version: browser.version,
      platform: browser.platform,
      name: testName(build),
      'idle-timeout': TEST_TIMEOUT_SECS,
      'max-duration': TEST_TIMEOUT_SECS,
      'command-timeout': 600,
      'tunnel-identifier': context.sauce.tunnel.identifier,
      'disable-popup-handler': false
    }, workerInitialized);

    function workerInitialized(err) {
      if (err) {
        console.log("Error creating Sauce worker: ")
        console.error(err);
        return cb(err);
      }
      worker.title(function(err, title) {
        console.log('[saucelabs] TESTING URL %j', url);
        worker.get(url, function(err) {
          if (err) cb(err);
          else scheduleWorkerPoll()
        });
      });
    }


    /// Polling for end

    function scheduleWorkerPoll() {
      setTimeout(pollWorker, POLL_FREQ_MS);
    }

    function pollWorker() {
      worker.eval('window.__codeswarm && window.__codeswarm.ended', gotPollResults);
    }

    function gotPollResults(err, ended) {
      if (err) cb(err);
      else {
        console.log('poll results: %j', ended);
        if (ended) testEnded();
        else scheduleWorkerPoll();
      }
    }

    function testEnded() {
      worker.eval('window.__codeswarm && window.__codeswarm.results', gotResults);
    }

    function gotResults(err, results) {
      worker.quit();
      cb(err, results);
    }
  }


  /// Test ended

  function done(err, results) {
    if (err) stage.error(err);

    var failed = false;

    results = parseResults(results);

    if (results.errors.length)
      stage.error(new Error(results.errors.join('\n')));

    stage.end({browsers: results.results});
  }

  function parseResults(results) {
    var url, urlResult, browser, browserResult;
    var finalResults = {}, errors = [];
    for(var urlIndex = 0 ; urlIndex < urls.length; urlIndex ++) {
      url = urls[urlIndex];
      urlResult = results[urlIndex];
      finalResults[url] = {};
      for(var browserIndex = 0 ; browserIndex < browsers.length;  browserIndex ++) {
        browser = browsers[browserIndex];
        browserResult = urlResult[browserIndex];
        finalResults[url][browser] = browserResult;

        console.log('BROWSER RESULT: %j', browserResult);

        if (browserResult && browserResult.results && browserResult.results.failed) {
          errors.push(
            'Tests on browser ' + browser +
            ' had ' + browserResult.results.failed + ' failures: ' +
            (browserResult.errors || ['unknown']).join('\n'));

        }
      }
    }

    return {
      errors: errors,
      results: finalResults
    };
  }

};

/// Misc

function testName(build) {
  return 'CodeSwarm: Testing ' + build.project + ', branch ' + build.branch + ', commit ' + build.commit;
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
    var parts = browser.split('-');
    return {
      name: parts[1],
      version: parts[2],
      platform: parts[0]
    };
  });
};
