/* npm */
var request = require('request').defaults({jar:false});

/* core */
var util = require('util');
var proc = require('child_process');
var EventEmitter = require('events').EventEmitter;

module.exports = SauceTunnel;

function SauceTunnel(stage, user, key, identifier, extraFlags) {
  EventEmitter.call(this);
  this.stage = stage;
  this.user = user;
  this.key = key;
  this.identifier = identifier || 'Tunnel'+new Date().getTime();
  this.baseUrl = ["https://", this.user, ':', this.key, '@saucelabs.com', '/rest/v1/', this.user].join("");
  this.extraFlags = extraFlags;
}

util.inherits(SauceTunnel, EventEmitter);

SauceTunnel.prototype.openTunnel = function(callback) {
  var me = this;

  var jarPath = process.env.SAUCE_JAR || __dirname + "/vendor/Sauce-Connect.jar";

  var args = ["-jar", , this.user, this.key];
  if (this.identifier) {
    args.push("-i", this.identifier);
  }
  if (this.extraFlags) {
    args = args.concat(this.extraFlags);
  }
  this.proc = this.stage.command('java', args, { silent: true, background: true });
  this.proc.stdout.setEncoding('utf8');
  var calledBack = false;

  this.proc.stdout.on('data', function(d) {
    console.log('[SAUCE] tunnel data:'.green, d);
    var data = typeof d !== 'undefined' ? d.toString() : '';
    if (typeof data === 'string' && !data.match(/^\[-u,/g)) {
      me.emit('verbose:debug', data.replace(/[\n\r]/g, ''));
    }
    if (typeof data === 'string' && data.match(/Connected\! You may start your tests/)) {
      me.emit('verbose:ok', '=> Sauce Labs Tunnel established');
      console.log('GOING TO FINISH UP!'.green);
      if (!calledBack) {
        console.log('CALLING BACK!'.green);
        calledBack = true;
        callback();
      }
    }
  });

  this.proc.stderr.on('data', function(data) {
    me.emit('log:error', data.toString().replace(/[\n\r]/g, ''));
  });

  this.proc.on('close', function(code) {
    me.emit('verbose:ok', 'Sauce Labs Tunnel disconnected ', code);
    if (!calledBack) {
      calledBack = true;
      callback(new Error('Sauce Labs tunnel disconnected'));
    }
  });
};

SauceTunnel.prototype.getTunnels = function(callback) {
  request({
    url: this.baseUrl + '/tunnels',
    json: true
  }, function(err, resp, body) {
    callback(body);
  });
};

SauceTunnel.prototype.killTunnel = function(callback) {
  this.emit('verbose:debug', 'Trying to kill tunnel');
  request({
    method: "DELETE",
    url: this.baseUrl + "/tunnels/" + this.identifier,
    json: true
  }, function (err, resp, body) {
    if (!err) {
      this.emit('verbose:debug', 'Tunnel Closed');
    }
    else {
      this.emit('log:error', 'Error closing tunnel');
    }
    callback(err);
  }.bind(this));
};

SauceTunnel.prototype.start = function(callback) {
  var me = this;
  this.emit('verbose:writeln', "=> Sauce Labs trying to open tunnel".inverse);
  this.openTunnel(callback);
};

SauceTunnel.prototype.stop = function(callback) {
  this.killTunnel(function(err) {
    callback(err);
  });
};