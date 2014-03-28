var async = require('async');

module.exports = prepare;

function prepare(build, stage, config, context) {

  async.series([
    runBeforeScripts,
    startCustomServer,
    startGateway
  ], done);

  function runBeforeScripts(cb) {
    if (config.before_script) {
      var scripts = config.before_script.split('\n').map(trim);
      async.eachSeries(scripts, runScript, cb);

    } else cb();

    function runScript(script, cb) {
      stage.command('bash', ['-c', script]).once('close', onCommandClose);

      function onCommandClose(code) {
        if (code != 0) cb(new Error('Exit code: ' + code));
        else cb();
      }
    }
  }

  function startCustomServer(cb) {
    if (! config.server_start_script || ! config.server_port) return cb();

    var serverOptions = {background:true, silent: true};
    var server =
      stage.command('bash', ['-c', config.server_start_script], serverOptions);
    setTimeout(cb, (config.server_start_wait || 5) * 1000);
  }

  function startGateway(cb) {
    var types = config.types || [];
    if (!Array.isArray(types)) types = [types];

    var args = [];
    types.forEach(function(type) {
      args.push('--type', type);
    });

    args.push('--docroot', '.');

    args.push('--port', '8080');

    if (config.server_start_script && config.server_port) {
      args.push('--proxy', config.server_port);
    }

    var files = config.files;
    if (! Array.isArray(files)) files = [files];
    files.forEach(function(file) {
      args.push('--inject', file + ':' + config.framework);
    });

    var gateway = stage.command('codeswarm-gateway', args, { background: true });
    gateway.stdout.setEncoding('utf8');
    gateway.stdout.on('data', onGatewayData);
    gateway.stderr.setEncoding('utf8');
    gateway.stderr.on('data', onGatewayStdError);

    gateway.once('close', onGatewayClose);

    var success = false;
    var out = '';
    var error = '';
    function onGatewayData(d) {
      console.log('[GATEWAY] %s'.yellow, d);
      if (! success) {
        out += d;
        detectSuccess();
      }
    }

    function detectSuccess() {
      var match = out.match(/listening on port/);
      if (match) {
        success = true;
        cb();
      }
    }

    function onGatewayStdError(d) {
      console.log('[GATEWAY] (stderr) %s'.yellow, d);
      error += d;
    }

    function onGatewayClose(code, signal) {
      console.log('[GATEWAY] Closed (code=%s, signal=%s)', code, signal);
      if (code != 0) {
        stage.error(new Error('Gateway closed with code ' + code + '. stderr = ' + error));
      }
    }
  }


  function done(err) {
    if (err) stage.error(err);
    stage.end();
  }

}


/// Misc

function trim(s) {
  return s.trim();
}