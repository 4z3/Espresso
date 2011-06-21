
// module: jquery_mobile_plugins

exports.deps = [ 'config', 'jquery_mobile' ];
exports.revdeps = [ 'files' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
