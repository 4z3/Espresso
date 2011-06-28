
// module: libraries

exports.deps = [
  'config'
, 'ui'
, 'core'
];
exports.revdeps = [ 'files' ];

exports.duty = function (callback) {
  var config = this.config;

  var that = this;

  if ('libraries' in config) {
    var i = 0;
    config.libraries.forEach(function (lib) {
      require('../../lib/espresso_utils').collectFiles.call(that, function () {
        if (++i === config.libraries.length) {
          callback();
        };
      },
      // TODO honor refs; we're now assuming "refs": ["*"]
      config.applicationDirectory + '/frameworks/' + lib.name);
    });
  } else {
    callback();
  };
};
