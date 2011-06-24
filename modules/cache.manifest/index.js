
// module: cache.manifest

exports.deps = [ 'config', 'files' ];

exports.duty = function (callback) {
  var config = this.config;
  var files = this.files;

  var content = [];

  function log () {
    //console.log.apply(this, arguments);
    content.push(Array.prototype.slice.call(arguments).join(' '));
  };

  log('CACHE MANIFEST');
  log('# Application: ' + config.name
      + ', Version: ' + config.version
      + ', Timestamp: ' + config.buildVersion);

  // Explicitly cached entries
  log('');
  log('CACHE:');
  // TODO read excludedFromCaching...
  Object.keys(files).forEach(function (filename) {
    var file = files[filename];
    if (file.requestPath) {
      log(file.requestPath);
    };
  });

  // Resources that require the device/user to be online.
  log('');
  log('NETWORK:');
  // TODO proxies -> no, we got *
  // TODO excludedFromCaching -> no, we got *

  // enable wildcard. 
  log('*');

  log('');
  log('FALLBACK:');
  // TODO this.manifest.fallback = config.cacheFallbacks;

  files['cache.manifest'] = {
    content: content.join('\r\n'),
    type: 'text/cache-manifest',
    requestPath: 'cache.manifest'
  };

  if (config.offlineManifest) {
    config.manifest = files['cache.manifest'];
  };

  callback(config.manifest);
};
