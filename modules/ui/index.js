
// module: ui

exports.deps = [
  'config'
, 'jquery'
, 'bootstrapping'
, 'jquery_mobile'
, 'jquery_mobile_plugins'
, 'jquery_mobile_plugins-theme'
, 'underscore'
, 'core'
];
exports.revdeps = [ 'files' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
