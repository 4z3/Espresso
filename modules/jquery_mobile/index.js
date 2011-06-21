
// module: jquery_mobile

exports.deps = [ 'config', 'jquery' ];
exports.revdeps = [ 'index.html' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;
