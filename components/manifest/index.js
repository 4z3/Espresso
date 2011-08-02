/*!
 * Espresso cache.manifest generator component
 *
 * Copyright(c) 2011 Panacoda GmbH. All rights reserved.
 * This file is licensed under the MIT license.
 */

var spawn = require('child_process').spawn;

module.exports = function (name, config, legacy_config) {

  // import legacy configuration
  if (!config.excludes) {
    config.excludes = legacy_config.excludedFromCaching || [];
  };
  if (!config.fallbacks) {
    config.fallbacks = legacy_config.cacheFallbacks || [];
  };

  // import "globals" from legacy configuration
  config.name = legacy_config.name;
  config.version = legacy_config.version;
  config.timestamp = legacy_config.buildVersion;

  // Add defaults to configuration
  [ 'index.html'
  , 'cache.manifest'
  ].forEach(function (filename) {
    if (config.excludes.indexOf(filename) < 0) {
      config.excludes.push(filename);
    };
  });

  // Prepare config for the shell child process
  [ 'excludes'
  , 'fallbacks'
  ].forEach(function (key) {
    config[key] = config[key].join('\n');
  });

  return function (path, callback) {

    var command = __dirname + '/run.sh';
    var args = [path];
    var options = {
      pwd: process.cwd(),
      env: Object.create(config)
    };

    var child = require('child_process').spawn(command, args, options);

    child.stdout.on('data', function (chunk) {
      process.stderr.write(chunk);
    });

    child.stderr.on('data', function (chunk) {
      process.stderr.write(chunk);
    });

    child.on('exit', function (code) {
      callback(code !== 0 && new Error('exit code: ' + code));
    });
  };
};
