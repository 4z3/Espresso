
// module: The-M-Project

exports.deps = [
  'config'
, 'jquery'
, 'bootstrapping'
, 'jquery_mobile'
, 'jquery_mobile_plugins'
, 'jquery_mobile_plugins-theme'
, 'underscore'
, 'themes'
, 'tmp_themes'
];
exports.revdeps = [ 'files' ];

exports.duty = function (callback) {
  callback();
};
