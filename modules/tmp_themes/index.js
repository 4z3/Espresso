
// module: tmp_themes

exports.deps = [ 'config', 'themes' ];
exports.revdeps = [ 'files' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
