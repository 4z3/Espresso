
// module: proxies

exports.deps = [ 'config' ];

var parse = require('url').parse,
    format = require('url').format,
    join = require('path').join,
    httpProxy = require('node-http-proxy');

exports.duty = function (callback) {
  var proxies = {
    add: add_proxy,
    has: has_proxy,
    get: get_proxy,
    handle: handle_proxy,
    table: {}
  };

  // create proxy table
  this.config.proxies.forEach(function (proxy) {
    proxies.add(join('/', proxy.proxyAlias), parse(proxy.baseUrl, true));
  });

  console.log('proxies', proxies);

  callback(proxies);
};

function add_proxy(path, uri) {
  path = path.split('/');
  var proxy = this.table;
  for (var i = 0, n = path.length; i < n; ++i) {
    if (!(path[i] in proxy)) {
      proxy = proxy[path[i]] = {};
    };
  };
  proxy['/'] = uri;
};

function has_proxy(path) {
  return !!this.get(path);
};

function get_proxy(path) {
  path = path.split('/');
  var proxy = this.table;
  var i = 0;
  for (var n = path.length; i < n && path[i] in proxy; ++i) {
    proxy = proxy[path[i]];
    //console.log('lookup', path[i], '=', proxy);
  };
  if (proxy instanceof Object && '/' in proxy) {
    // create new proxy entry with the correct pathname,
    // i.e. the proxyAlias sliced off
    proxy = JSON.parse(JSON.stringify(proxy['/']));
    proxy.pathname = join.apply(this, [proxy.pathname].concat(path.slice(i)))
    return proxy;
  };
};

function handle_proxy(req, res) {
  var uri = parse(req.url, true);
  var proxy = this.get(uri.pathname);
  if (proxy) {
    //console.log('proxy:', proxy);
    
    switch (proxy.protocol) {
      case 'http:':
        // rewrite request
        var host = proxy.hostname;
        var port = Number('port' in proxy ? proxy.port : '80');
        req.headers.host = port === 80 ? host : [host, port].join(':');
        uri.pathname = proxy.pathname;
        req.url = format(uri);
    
        // mangle uri for debug output
        uri.protocol = proxy.protocol;
        uri.hostname = proxy.hostname;
        uri.host = host;
        uri.port = port;
        console.log('proxy request:', format(uri));
    
        // delegate request
        (new httpProxy.HttpProxy()).proxyRequest(req, res, {
          host: host,
          port: port
        });
        break;
      default:
        var content = 'Cannot serve; bad protocol in ' + uri.pathname;
        console.log(content);
        res.writeHead(500, 'Internal Server Error', {
          'Content-Type': 'text/plain',
          'content-Length': content.length
        });
        res.end(content);
        break;
    };

    // signal that we've handled the request
    return true;
  };
};
