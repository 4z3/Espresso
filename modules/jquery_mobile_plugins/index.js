
// module: jquery_mobile_plugins

exports.deps = [ 'config', 'jquery_mobile' ];
exports.revdeps = [ 'index.html' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
