
// module: jquery

exports.deps = [ 'config' ];
exports.revdeps = [ 'files', 'foobar' ];

exports.duty = require('../../lib/espresso_utils').collectFiles;


// TODO exports = new require('../../lib/module').CollectFiles({...}) // (?)
