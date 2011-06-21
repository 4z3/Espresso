
// module: underscore

exports.deps = [ 'config' ];
exports.revdeps = [ 'index.html' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
