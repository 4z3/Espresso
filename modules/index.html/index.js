
// module: index.html

jsdom = require('jsdom');

exports.deps = [ 'config', 'cache.manifest', 'scripts', 'styles' ];

exports.duty = function (callback) {
  var config = this.config;
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

    // append all scripts
    config.scripts.forEach(function (file) {
      try {
        var script = window.document.createElement('script');
        script.type = 'application/javascript';
        script.src = file.href;
        $('head').append(script);
      } catch (exn) {
        console.error(exn.stack); // TODO communicate to callback
      };
    });

    callback('<!DOCTYPE html>' + window.document.innerHTML);
  });
};
