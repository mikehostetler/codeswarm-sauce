module.exports = prepare;

function prepare(build, stage, config, context) {
  var types = config.types || [];

  var args = [];
  types.forEach(function(type) {
    args.push('--type', type);
  });

  args.push('--docroot', '.');

  args.push('--port', '8080');

  var gateway = stage.command('codeswarm-gateway', args, { background: true });
  gateway.stdout.setEncoding('utf8');
  gateway.stdout.on('data', onGatewayData);

  var out = '';
  function onGatewayData(d) {
    out += d;
    detectSuccess();
  }

  var success = false;
  function detectSuccess() {
    var match = out.match(/listening on port/);
    if (match) {
      success = true;
      stage.end();
    }
  }


}