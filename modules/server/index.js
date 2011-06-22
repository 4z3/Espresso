
// module: server

exports.deps = [ 'config', 'build' ];

exports.duty = function (callback) {
};

var http = require('http'),
    httpProxy = require('node-http-proxy');

//
// Create a new instance of HttProxy to use in your server
//
var proxy = new httpProxy.HttpProxy();

//
// Create a regular http server and proxy its handler
//
http.createServer(function (req, res) {

  console.log({
    'req': req,
    'req.url': req.url,
    'req.headers.host': req.headers.host
  });

  console.log('config:', this.config);

  var host = req.headers.host = 'google.com'; // localhost
  var port = 80; // 9000
  var path = req.url = '/index.html';

  //
  // Put your custom server logic here, then proxy
  //
  proxy.proxyRequest(req, res, {
    host: host,
    port: port
  });
}).listen(8001);

//http.createServer(function (req, res) {
//  res.writeHead(200, { 'Content-Type': 'text/plain' });
//  res.write('request successfully proxied: ' + req.url +'\n' + JSON.stringify(req.headers, true, 2));
//  res.end();
//}).listen(9000); 

