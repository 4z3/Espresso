
// module: save-local

exports.deps = [ 'config', 'files', 'index.html' ];

exports.duty = function (callback) {
  var config = this.config;
  var files = this.files;

  var join = require('path').join;
  var dirname = require('path').dirname;
  var mkdirs = require('node-utils/file').mkdirs;
  var writeFile = require('fs').writeFile;

  var outputDirectory = join(
    config.applicationDirectory,
    'build',
    config.buildVersion.toString()
  );

  var count = Object.keys(files).length;

  Object.keys(files).forEach(function (filename) {
    var file = files[filename];
    if (file.requestPath) {
      var path = join(outputDirectory, file.requestPath);
      console.log('save:', path);
      mkdirs(dirname(path), 0755, function () {
        // TODO encoding?
        writeFile(path, file.content, function (err) {
          if (err) {
            console.error('Error:', err.stack);
          };
          if (--count === 0) {
            callback();
          };
        });
      });
    } else {
      if (--count === 0) {
        callback();
      };
    };
  });
};
