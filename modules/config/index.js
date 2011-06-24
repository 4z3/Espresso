
// module: config

exports.deps = [ 'defaults', 'config.json', 'command-line' ];

exports.duty = function (callback) {
  var that = this;
  var config = {};
  exports.deps.forEach(function (name) {
    for (key in that[name]) {
      config[key] = that[name][key];
    };
  });
  console.log('config:', JSON.stringify(config, null, 2));
  return callback(config);
};
