
// module: app

exports.deps = [ 'config' ];
exports.revdeps = [ 'cache.manifest', 'files' ];

exports.duty = function (callback) {

  var config = this.config;
  var files = this.config.files;

  var context = {
    self: this.self,
    config: {
      files: {}
    }
  };

  var prologue = {
    filename: '{{{app:prologue}}}',
    framework: 'app/prologue', //this.self.name, // self.name = 'app' vs. config.name = ...
    is_root_file: true,
    requestPath: null,
    type: 'application/javascript',
    analysis: {
      definitions: [
        this.config.name,
        'M.Application.name'
      ],
      references: [
        'M.Application',
        'M'
      ]
    },
    content: [
      'var ' + this.config.name + '=' + this.config.name + '||{}',
      'M.Application.name=' + JSON.stringify(this.config.name)
    ].join(';')
  };

  var epilogue = {
    filename: '{{{app:epilogue}}}',
    framework: 'app/epilogue',
    is_root_file: true,
    requestPath: null,
    type: 'application/javascript',
    analysis: {
      definitions: [],
      references: [
        this.config.name,
        this.config.name + '.app',
        this.config.name + '.app.main'
      ]
    },
    content: [
      this.config.name + '.app.main()'
    ].join(';')
  };

  var app_name = this.config.name;

  files[prologue.filename] = prologue;
  files[epilogue.filename] = epilogue;

  // "mark root files"
  require('../../lib/espresso_utils').collectFiles.call(context,
    function () {
      Object.keys(context.config.files).forEach(function (filename) {
        var file = context.config.files[filename];
        file.is_root_file = true;
        files[filename] = file;
      });
      callback();
    },
    this.config.applicationDirectory + '/app'); // TODO add to search path
};
