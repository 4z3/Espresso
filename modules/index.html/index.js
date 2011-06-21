
// module: index.html

jsdom = require('jsdom');

exports.deps = [ 'config', 'files', 'cache.manifest', 'scripts', 'styles' ];

exports.duty = function (callback) {
  var config = this.config;
  var scripts = this.scripts;
  var styles = this.styles;
  var files = this.files;
  var jquery_uri = '../../frameworks/The-M-Project/modules/jquery/jquery-1.6.1.min.js';

  //
  // Generate index.html
  //
  var window = jsdom.jsdom().createWindow();
  jsdom.jQueryify(window, [jquery_uri], function(window, $) {
    // remove the jquery script element
    $('script').remove();

    // TODO manifest: this.offlineManifest && 'cache.manifest'
    $('html').attr('manifest', 'cache.manifest');

    window.document.title = config.displayName || config.name;

    styles.forEach(function (file) {
      try {
        var element = window.document.createElement('link');
        element.type = file.type;
        element.href = file.requestPath;
        element.rel = 'stylesheet';
        $('head').append(element);
      } catch (exn) {
        console.error(exn.stack); // TODO communicate to callback
      };
    });

    scripts.forEach(function (file) {
      try {
        var element = window.document.createElement('script');
        element.type = file.type;
        element.src = file.requestPath;
        $('head').append(element);
      } catch (exn) {
        console.error(exn.stack); // TODO communicate to callback
      };
    });

    files['index.html'] = {
      requestPath: 'index.html',
      type: 'text/html',
      content: '<!DOCTYPE html>' + window.document.innerHTML
    };

    callback();
  });
};
