
// module: package.json

exports.deps = [ 'files' ];

var join = require('path').join,
    readFile = require('fs').readFile;

exports.duty = function (callback) {
  var files = this.files;
  var filename = this.self.name;
  var path = join(__dirname, '..', '..', filename);

  readFile(path, function (err, content) {
    if (err) {
      console.error(err.stack.toString());
      callback();
    } else {
      try {
        var object = JSON.parse(content);

        files[filename] = {
          content: content,
          type: 'application/json'
        };

        callback(object);
      } catch (exn) {
        console.error(exn.stack.toString());
        callback();
      };
    };
  });
};
