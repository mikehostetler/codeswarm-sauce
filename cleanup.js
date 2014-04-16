module.exports = cleanup;

function cleanup(build, stage, config, context) {
  var tunnel = context.sauce && context.sauce.tunnel;
  if (tunnel) {
    stage.fakeCommand('stopping saucelabs tunnel');
    tunnel.stop(stopped);
  } else stopped();

  function stopped(err) {
    stage.out('stopping saucelabs tunnel...'.green);
    if (err) stage.error(err);
    stage.end();
  }
}