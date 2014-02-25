module.exports = {
  workerImage: 'browser',
  env:         require('./env'),
  test:        require('./test'),
  cleanup:     require('./cleanup'),
  config:      require('./config')
};