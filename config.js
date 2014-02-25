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
    name: 'urls',
    label: 'URLs (one per line)',
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
    name: 'browsers',
    label: 'Browsers',
    type: 'selectMultiple',
    from: browsers
  }
];
