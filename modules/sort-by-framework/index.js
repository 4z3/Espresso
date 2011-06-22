
// module: sort-by-framework

exports.deps = [ 'config', 'files', 'scripts', 'sort-by-m_require' ];
exports.revdeps = [ 'index.html', 'merge-by-framework' ];

exports.duty = function (callback) {

  // that order
  var framework_names = [
    'jquery'
  , 'bootstrapping'
  , 'jquery_mobile'
  , 'jquery_mobile_plugins'
  , 'jquery_mobile_plugins-theme'
  , 'underscore'
  , 'core'
  , 'ui'
  , 'app/prologue'
  , 'app' 
  , 'app/epilogue'
  ];

  var buckets = {};
  framework_names.forEach(function (name) {
    buckets[name] = [];
  });
  var rest = [];

  this.scripts.forEach(function (file) {
    if (file.framework in buckets) {
      console.log(file.requestPath, '@', file.framework);
      buckets[file.framework].push(file);
    } else {
      console.log(file.requestPath, '@', file.framework, 'REST');
      rest.push(file);
    };
  });

  var sorted_scripts = [];
  framework_names.forEach(function (name) {
    sorted_scripts = sorted_scripts.concat(buckets[name]);
  });
  sorted_scripts = sorted_scripts.concat(rest);

  console.log('scripts sorted by framework:');
  sorted_scripts.forEach(function (file) {
    console.log(file.framework, file.requestPath);
  });

  var scripts = this.scripts;
  var files = this.files;

  while (this.scripts.length > 0) {
    scripts.pop();
  };

  sorted_scripts.forEach(function (file) {
    scripts.push(file);
  });

  callback();
};
