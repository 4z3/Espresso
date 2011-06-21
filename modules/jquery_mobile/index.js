
// module: jquery_mobile

exports.deps = [ 'config', 'jquery' ];
exports.revdeps = [ 'files' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
