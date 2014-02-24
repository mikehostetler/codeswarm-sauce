module.exports = cleanup;

function cleanup(build, stage, config, context) {
  console.log('CLEANUP CONTEXT: %j', context);
  var tunnel = context.sauce && context.sauce.tunnel;
  if (tunnel) {
    console.log('STOPPING SAUCE TUNNEL...'.green);
    tunnel.stop(stopped);
  } else stopped();

  function stopped(err) {
    console.log('STOPPED SAUCE TUNNEL'.green);
    if (err) stage.error(err);
    stage.end();
  }
}