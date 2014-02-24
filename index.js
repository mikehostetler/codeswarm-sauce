
/// workerImage

exports.workerImage = 'browser';


/// init

exports.init = init

function init(cb) {
  /// We could initialize here if we wanted to
  process.nextTick(cb);
}


exports.env = require('./env');

/// prepare

// exports.prepare = prepare;

// function prepare(build, stage) {
//   stage.command('npm', ['install']);
//   stage.end();
// }

/// test

// exports.test = test;

// function test(build, stage) {
//   stage.command('npm', ['test']);
//   stage.end();
// }

// exports.analyze = ...

// exports.deploy = ...

// exports.cleanup = ...

exports.cleanup = require('./cleanup');

exports.config = [
  { name: 'sauce_username', label: 'Saucelabs username', type: 'string', required: true },
  { name: 'sauce_access_key', label: 'Saucelabs access key', type: 'string', required: true }
];