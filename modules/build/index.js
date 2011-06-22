
// module: build

exports.deps = [
  'config',
  'The-M-Project',
  'index.html',
  'save-local',
  'eliminate',
  'app',
  'files',
  'scripts',
  'sort-by-m_require',
  'sort-by-framework',
  'merge-by-framework'
];

exports.duty = function (callback) {

  console.log();

  (function walk (that) {
    if (that instanceof Object) {
      Object.keys(that).forEach(function (x) {
        if (that[x] instanceof Object) {
          if (that[x] instanceof Buffer || that[x] instanceof Job) {
            that[x] = '[...]';
          } else {
            [ 'tree', 'content' ].forEach(function (y) {
              if (y in that[x]) {
                that[x][y] = '[...]';
              };
            });
            walk(that[x]);
          };
        };
      });
    };
  })(this);

  console.log('== summary ==');

  console.log(require('util').inspect(this, false, 10));
  callback();
};
