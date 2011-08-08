/*!
 * Espresso server component
 *
 * Copyright(c) 2011 Panacoda GmbH. All rights reserved.
 * This file is licensed under the MIT license.
 */

var spawn = require('child_process').spawn;

module.exports = function (name, config, legacy_config) {
  return function (path, callback) {

    var env = Object.create(config);
    env.app_name = legacy_config.name;
    env.Node_exe = process.argv[0];
    env.Espresso_dir = __dirname + '/../..';

    var command = __dirname + '/run.sh';
    var args = [path];
    var options = {
      pwd: process.cwd(),
      env: env
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
