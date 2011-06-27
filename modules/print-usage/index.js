
// module: print-usage

exports.deps = [ 'command-line' ];

exports.duty = function (callback) {
  this['command-line'].usage();
  callback();
};
