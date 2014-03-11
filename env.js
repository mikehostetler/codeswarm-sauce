var request = require('request');
var SauceTunnel = require('./sauce_tunnel');


module.exports = env;

function env(build, stage, config, context) {
  context.sauce = {};
  context.sauce.tunnel =
    new SauceTunnel(stage, config.sauce_username, config.sauce_access_key);

  context.sauce.tunnel.start(started);

  function started(err) {
    console.log('[codeswarm-browser] TUNNEL STARTED'.green, err);
    if (err) stage.error(err);
    stage.end();
  }
}