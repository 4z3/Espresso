
// module: phonegap

exports.deps = [ 'config' ];
// TODO phonegap has to place itself into index.html-skel
// TODO how to enable phonegap?

exports.before = [ 'index.html' ];

exports.duty = function (callback) {

  var phonegap = {
    script: [
      { src: 'phonegap.js' },
      { innerHTML: [
        'var ' + this.config.name + ' = ' + this.config.name + ' || {}',
        'M.Application.name = ' + JSON.stringify(this.config.name)
          ].join(';')
      }
    ]
  };

  callback(phonegap);
};
