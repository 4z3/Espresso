
// module: styles

exports.deps = [ 'config', 'files', 'images' ];
exports.revdep = [ 'cache.manifest' ];

exports.duty = function (callback) {
  var files = this.files;
  var styles = this.config.styles;

  Object.keys(files).forEach(function (filename) {
    var match = /\.([^.]+)$/.exec(filename);
    if (match) {
      var ext = match[1];
      // TODO put file into some cache
      // TODO put this into a Content-Type-detection module
      switch (ext) {
        case 'css':
          var file = files[filename];
          file.type = 'text/css';
          file.requestPath = 'theme/' + require('path').basename(filename);
          styles.push(file);
          break;
      };
    };
  });

  callback(styles);
};
