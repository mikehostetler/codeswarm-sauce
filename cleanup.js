module.exports = cleanup;

function cleanup(build, stage, config, context) {
  var tunnel = context.sauce && context.sauce.tunnel;
  if (tunnel) {
    console.log('[codeswarm-browser] stopping saucelabs tunnel...'.green);
    tunnel.stop(stopped);
  } else stopped();

  function stopped(err) {
    console.log('[codeswarm-browser] stopped saucelabs tunnel.'.green);
    if (err) stage.error(err);
    stage.end();
  }
}