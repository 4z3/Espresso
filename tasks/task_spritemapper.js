/*!
 * task_spritemapper.js
 *
 * Copyright 2011, Panacoda GmbH.  All rights reserved.
 * This file is licensed under the MIT license.
 *
 * @author tv
 */

/**
 * @class
 * ????
 *
 * @extends Task
 */
Task = exports.Task = function () {
  this.name = 'spritemapper';
};

Task.prototype = new (require('./task').Task)();

spawn = require('child_process').spawn;
spritemapper = __dirname + '/../bin/spritemapper';

Task.prototype.duty = function (framework, callback) {

  var stylesheets = {};

  framework.files.forEach(function (file) {
    if (!file.isStylesheet()) {
      return; // ignore non-stylesheet files
    };
    if (/.*\/sm_[^\/]+\.css$/.test(file.path)) {
      return; // ignore spritemapper files (pattern: sm_{basename}{extension})
    };
    stylesheets[file.path] = file;
  });

  if (Object.keys(stylesheets).length > 0) {
    var processed_stylesheets = 0;

    function callback_when_done() {
      if (processed_stylesheets === Object.keys(stylesheets).length) {
        console.log(framework.name + ': all stylesheets processed');
        callback(framework);
      };
    };

    function process_stylesheet(file, callback) {
      var child = spawn(spritemapper, [file.path]);
      var data = '';

      function nom(chunk) {
        process.stdout.write(file.path + ': ' + chunk);
        // XXX we could kick out old lines if we care for memory
        data += chunk;
      };

      child.stdout.on('data', nom);
      child.stderr.on('data', nom);

      child.on('exit', function (code) {
        if (code !== 0) {
          // spritmapper failed -- do nothing
          // TODO print warning?
          callback();
        } else {
          var re = /(?:^|\n)writing new css at (.*)(?:\n|$)/;
          var match = re.exec(data);
          if (match) {
            var new_path = match[1];
            console.log('got milk:', match[1]);
            require('fs').readFile(new_path, function (err, data) {
              if (err) {
                console.log('spritemapper:', err);
              } else {
                console.log('style:' + data);
                // simply replace the stylesheet with the new one..
                // TODO add the new image to the framework and kick
                // out all old images
                //  - what are the old images?
                file.content = data;
              };

              // TODO add
              // writing spritemap image at /tmp/The-M-Project-Sample-Apps/KitchenSink/app/resources/base/images.png

              //console.log('xxxxxxxxxxxxxxxxxxxx', require('sys').inspect(file,false, 1000));


              callback();
            });
          };
        };
      });
    };

    Object.keys(stylesheets).forEach(function (path) {
      var file = stylesheets[path]; 
      process_stylesheet(file, function () {
        console.log('process stylesheet:', path);
        processed_stylesheets++;
        callback_when_done();
      });
    });
  } else {
    callback(framework);
  };

  //var spritemapper = spawn(

  //child = exec('cat *.js bad_file | wc -l',
  //    function (error, stdout, stderr) {
  //      console.log('stdout: ' + stdout);
  //      console.log('stderr: ' + stderr);
  //      if (error !== null) {
  //        console.log('exec error: ' + error);
  //      }
  //    });

  //return callback(framework);
};
