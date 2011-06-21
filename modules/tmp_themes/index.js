
// module: tmp_themes

exports.deps = [ 'config', 'themes' ];
exports.revdeps = [ 'index.html' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
