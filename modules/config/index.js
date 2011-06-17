
// module: config

fs = require('fs');

exports.deps = [ 'defaults' ];

exports.duty = function (callback) {
  try {
    fs.readFile(this.defaults.configFilename, function (err, content) {
      try {
        if (err) throw new Error(err.message);

        content = JSON.parse(content);

        var config = Object.create(this.defaults);
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
