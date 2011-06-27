
// module: modules

var Module = require('../../lib/module');
var modules = null;

exports.deps = [
];

exports.duty = function (callback) {
  if (modules) {
    return callback(modules);
  };

  var join = require('path').join;
  var readdir = require('fs').readdir;

  var module_path = join(__dirname, '..');

  console.log('module_path:', module_path);

  readdir(module_path, function (err, filenames) {
    var _modules = {};
    filenames.forEach(Module.load);
    Module.forEach(function (module) {
      _modules[module.name] = module;
    });

    //console.log('modules:', modules);

    callback(modules = _modules);
  });
};
