var browsers = require('./browsers.json');

function organize(browsers) {
  return browsers.map(completeName);
}

function completeName(browser) {
  return browser.os + '-' + browser.api_name + '-' + browser.short_version;
}

module.exports = organize(browsers);