
// module: jquery_mobile_plugins-theme

exports.deps = [ 'config', 'jquery_mobile_plugins' ];
exports.revdeps = [ 'index.html' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
