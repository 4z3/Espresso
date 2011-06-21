
// module: images

exports.deps = [ 'files', 'config' ];
exports.revdep = [ 'cache.manifest' ];

exports.duty = function (callback) {
  var files = this.files;
  var config = this.config;
  var images = config.images;

  Object.keys(files).forEach(function (filename) {
    var match = /\.([^.]+)$/.exec(filename);
    if (match) {
      var ext = match[1];
      // TODO put file into some cache
      // TODO put this into a Content-Type-detection module

      switch (ext) {
        case 'png':
        case 'jpg':
        case 'gif':
        case 'svg':
          var file = files[filename];
          file.type = config.types[ext];
          file.requestPath = 'theme/images/' + require('path').basename(filename);
          images.push(file);
          break;
      };
    };
  });

  callback(images);
};
