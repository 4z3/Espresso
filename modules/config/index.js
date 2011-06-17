
// module: config

fs = require('fs');

exports.deps = [ 'defaults' ];

exports.duty = function (callback) {
  var defaults = this.defaults;
  try {
    fs.readFile(defaults.configFilename, function (err, content) {
      try {
        if (err) throw new Error(err.message);

        // "config" = "defaults" + config.json
        content = JSON.parse(content);
        var config = Object.create(defaults);
        for (key in content) {
          config[key] = content[key];
        };

        return callback(config);
      } catch (exn) {
        console.error(exn.stack);
        return callback(); // TODO communicate error
      };
    });
  } catch (exn) {
    console.error(exn.stack);
    return callback(); // TODO communicate error
  };
};
