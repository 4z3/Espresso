
// module: files

exports.deps = [ 'config' ];

exports.duty = function (callback) {
  callback(this.config.files);
};
