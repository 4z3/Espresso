
// module: config.json

fs = require('fs');

exports.deps = [ 'defaults' ];

exports.duty = function (callback) {
  try {
    fs.readFile(this.defaults.configFilename, function (err, content) {
      try {
        if (err) throw new Error(err.message);
        return callback(JSON.parse(content));
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
