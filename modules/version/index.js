
// module: version

exports.subcommand = {
  description: 'Print the Espresso version.'
};

exports.deps = [ 'package.json' ];

exports.duty = function (callback) {
  var version = this['package.json'].version;

  console.log('Espresso ' + version);

  callback(version);
};
