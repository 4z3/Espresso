
// module: scripts

exports.deps = [ 'files', 'config' ];
exports.revdep = [ 'cache.manifest' ];

exports.duty = function (callback) {
  var files = this.files;
  var scripts = this.config.scripts;

  Object.keys(files).forEach(function (filename) {
    var match = /\.([^.]+)$/.exec(filename);
    if (match) {
      var ext = match[1];
      // TODO put file into some cache
      // TODO put this into a Content-Type-detection module
      switch (ext) {
        case 'js':
          var file = files[filename];
          file.type = 'application/javascript';
          file.requestPath = require('path').basename(filename);
          scripts.push(file);
          break;
      };
    };
  });

  callback(scripts);
};
