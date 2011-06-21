
// module: app

exports.deps = [ 'config' ];
exports.revdeps = [ 'cache.manifest', 'files' ];

exports.duty = function (callback) {

  var config = this.config;
  var files = this.config.files;

  var context = {
    config: {
      files: {}
    }
  };

  // "mark root files"
  require('../../lib/espresso_utils').collectFiles.call(context,
    function () {
      Object.keys(context.config.files).forEach(function (filename) {
        var file = context.config.files[filename];
        file.is_root_file = true;
        files[filename] = file;
      });
      callback();
    },
    this.config.applicationDirectory + '/app');
};
