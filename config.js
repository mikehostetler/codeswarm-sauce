var browsers   = require('./browsers');
var frameworks = require('./frameworks');

module.exports = [
  {
    name: 'sauce_username',
    label: 'Saucelabs username',
    type: 'string',
    required: true
  },
  {
    name: 'sauce_access_key',
    label: 'Saucelabs access key',
    type: 'string',
    required: true
  },
  {
    name: 'files',
    label: 'Test files (one per line)',
    type: 'text',
    required: true
  },
  {
    name: 'framework',
    label: 'Framework',
    type: 'selectOne',
    from: frameworks
  },
  {
    name: 'types',
    label: 'File types',
    type: 'selectMultiple',
    from: [
      'php'
    ]
  },
  {
    name: 'before_script',
    label: 'Before test scripts (one per line)',
    type: 'text'
  },
  {
    name: 'server_start_script',
    label: 'Server start script (goes to background)',
    type: 'string'
  },
  {
    name: 'server_start_wait',
    label: 'Server bootup wait (seconds, defaults to 5)',
    type: 'string'
  },
  {
    name: 'server_port',
    label: 'Server port (default is 8080)',
    type: 'string'
  },
  {
    name: 'browsers',
    label: 'Browsers',
    type: 'selectMultiple',
    from: browsers
  }
];
