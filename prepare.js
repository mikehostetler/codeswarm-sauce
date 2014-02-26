module.exports = prepare;

function prepare(build, stage, config, context) {
  var types = config.types || [];
  if (!Array.isArray(types)) types = [types];

  var args = [];
  types.forEach(function(type) {
    args.push('--type', type);
  });

  args.push('--docroot', '.');

  args.push('--port', '8080');

  var gateway = stage.command('codeswarm-gateway', args, { background: true });
  gateway.stdout.setEncoding('utf8');
  gateway.stdout.on('data', onGatewayData);

  var success = false;
  var out = '';
  function onGatewayData(d) {
    console.log('[GATEWAY] %s'.blue, d);
    if (! success) {
      out += d;
      detectSuccess();
    }
  }

  function detectSuccess() {
    var match = out.match(/listening on port/);
    if (match) {
      success = true;
      stage.end();
    }
  }


}