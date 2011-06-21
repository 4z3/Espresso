
// module: scripts

exports.deps = [ 'files', 'config' ];

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
          scripts.push({
            src: require('path').basename(filename),
            file: files[filename]
          });
          break;
      };
    };
  });

  callback(scripts);
};
