
// module: config

exports.deps = [ 'defaults', 'config.json', 'command-line' ];

exports.duty = function (callback) {
  var that = this;

  var tail = exports.deps.slice();
  var head = tail.shift();

  // Use defaults as a base and copy properties from config.json, command-line.
  // We do this, so other modules can overwrite defaults.
  var config = Object.create(that[head]);
  tail.forEach(function (name) {
    for (key in that[name]) {
      config[key] = that[name][key];
    };
  });

  //console.log('config:', JSON.stringify(config, null, 2));
  return callback(config);
};
