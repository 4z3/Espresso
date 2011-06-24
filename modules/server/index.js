
// module: server

exports.deps = [ 'config', 'build', 'files', 'config', 'proxies' ];

var http = require('http'),
    parse = require('url').parse,
    format = require('url').format,
    join = require('path').join;

exports.duty = function (callback) {
  var config = this.config;
  var proxies = this.proxies;
  var prefix = '/' + config.name;

  // create file table
  var files = this.files;
  var file_table = {};
  Object.keys(this.files).forEach(function (filename) {
    var file = files[filename];
    if (typeof file.requestPath === 'string') {
      var requestPath = join(prefix, file.requestPath);
      file_table[requestPath] = file;
    };
  });

  // TODO trigger rebuild
  
  http.createServer(function (req, res) {
    var url = parse(req.url, true);

    // rewrite
    // TODO redirect client, when pathname === prefix (?)
    switch (url.pathname) {
      case prefix + '/':
        url.pathname += 'index.html';
        req.url = format(url);
    };
  
    // dispatch
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
    } else if (!proxies.handle(req, res)) {
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
      'http://' + config.hostname + ':' + config.port + prefix);
  });
};
