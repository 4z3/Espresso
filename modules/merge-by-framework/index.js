
// module: merge-by-framework

exports.deps = [ 'files', 'scripts', 'sort-by-framework', 'sort-by-m_require' ];
exports.revdeps = [ 'index.html', 'minify' ];

exports.duty = function (callback) {

  var files = this.files;

  // move scripts to old_scripts
  var scripts = this.scripts;
  var old_scripts = [];
  while (scripts.length > 0) {
    var file = scripts.shift();
    if ('requestPath' in file) {
      old_scripts.push(file);
    };
  };

  // fill scripts with merged scripts
  var name;
  var contents = [];
  var mergeInline = false;
  old_scripts.forEach(function (file) {
    if (file.framework !== name) {
      if (contents.length > 0) {
        var filename = '{{' + name + ':merged}}';
        scripts.push(files[filename] = {
          type: 'application/javascript',
          filename: filename,
          // TODO ensure there is only one...
          requestPath: mergeInline ? null : name + '.js',
          content: contents.join(';')
        });
      };
      name = file.framework;
      contents = [];
      mergeInline = false;
    };
    // TODO check if script has correct format before adding content
    contents.push(file.content);
    console.log(name, '+=', file.requestPath || file.filename);
    if (file.requestPath === null) {
      mergeInline = true;
    };
    // eliminate file by removing it's requestPath
    delete file.requestPath;
  });
  // merge last script
  if (contents.length > 0) {
    var filename = '{{' + name + ':merged}}';
    scripts.push(files[filename] = {
      type: 'application/javascript',
      filename: filename,
      // TODO ensure there is only one...
      requestPath: mergeInline ? null : name + '.js',
      content: contents.join(';')
    });
  };

  callback();
};
