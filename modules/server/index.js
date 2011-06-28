
// module: server

// TODO use real defaults from defaults module in descriptions
exports.subcommand = {
  description: 'Run the development server.',
  options: [
    {
      options: [ '-m', '--manifest' ],
      description: 'Enable generation of cache.manifest.',
      handler: 'config',
      config: 'offlineManifest'
    }
  ],
  parameters: [
    {
      options: ['-d','--directory'],
      description:
        'Specify a custom project directory. Default: ' + process.cwd(),
      handler: 'config',
      config: 'applicationDirectory'
    },
    {
      options: ['-c','--config'],
      description:
        'Specify a custom configuration file. Default: '
        + process.cwd() + '/config.json',
      handler: 'config',
      config: 'configFilename'
    },
    {
      options: ['-p','--port'],
      description: 'Specify a custom port. Default: ' + 8000,
      handler: 'config',
      config: 'port'
    },
  ]
};

exports.deps = [ 'defaults', 'config', 'proxies' ];

var http = require('http'),
    parse = require('url').parse,
    format = require('url').format,
    join = require('path').join;

exports.duty = function (callback) {
  var that = this;
  var defaults = this.defaults;
  var config = this.config;
  var proxies = this.proxies;
  var prefix = '/' + config.name;

  var file_table = {};

  http.createServer(function (req, res) {
    var url = parse(req.url, true);

    // rewrite
    // TODO redirect client, when pathname === prefix (?)
    switch (url.pathname) {
      case prefix + '/':
        url.pathname += 'index.html';
        req.url = format(url);
    };

    console.log('[35;1mrequest:', url.pathname, '[m');

    if (url.pathname === prefix + '/index.html') {
      // build or rebuild file_table

      // TODO honor -m parameter
      defaults.offlineManifest = false;

      var agenda = [
        //'config',
        'The-M-Project',
        'index.html',
        'eliminate',
        'app',
        'files',
        'scripts',
        'sort-by-m_require',
        'sort-by-framework',
        'merge-by-framework'
      ];

      function dispatcher (_ignored_callback) {

        // create file table
        file_table = {};
        var files = this.files;
        Object.keys(this.files).forEach(function (filename) {
          var file = files[filename];
          if (typeof file.requestPath === 'string') {
            var requestPath = join(prefix, file.requestPath);
            file_table[requestPath] = file;
          };
        });

        dispatch(req, res);
      };

      var Scheduler = require('../../lib/scheduler');
      Scheduler.schedule(agenda).run(dispatcher, that.self.scheduler.results);
    } else if (proxies.handle(req, res)) {
      /* nothing to do */
    } else if (dispatch(req, res)) {
      /* nothing to do */
    } else {
      var content = 'Not found: ' + url.pathname;
      console.log(content);
      res.writeHead(404, 'Not Found', {
        'Content-Type': 'text/plain',
        'content-Length': content.length
      });
      res.end(content);
    };
  }).listen(config.port, config.hostname, function () {
    console.log('Server running at',
      'http://' + config.hostname + ':' + config.port + prefix + '/');
  });

  function dispatch (req, res) {
    var url = parse(req.url, true);
    if (url.pathname in file_table) {
      var file = file_table[url.pathname];

      var content = file.content;
      if (!(content instanceof Buffer)) {
        content = new Buffer(file.content);
      };
      content.type = file.type;

      console.log('serve file:', url.pathname, content.type, content.length);
      res.writeHead(200, 'OK', {
        'Content-Length': content.length,
        'Content-Type': content.type
      });
      res.end(content);
      return true;
    };
  };
};
