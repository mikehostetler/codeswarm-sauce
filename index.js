var browsers = require('./browsers');

/// workerImage

exports.workerImage = 'browser';


/// env

exports.env = require('./env');


/// test

exports.test = require('./test');

exports.cleanup = require('./cleanup');

exports.config = [
  { name: 'sauce_username', label: 'Saucelabs username', type: 'string', required: true },
  { name: 'sauce_access_key', label: 'Saucelabs access key', type: 'string', required: true },
  { name: 'browsers', label: 'browsers', type: 'selectMultiple', from: browsers }
];

