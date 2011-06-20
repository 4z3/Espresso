
// module: index.html

jsdom = require('jsdom');

exports.deps = [ 'config' ];

exports.duty = function (callback) {
  var config = this.config;

  //
  // Generate index.html
  //
  var window = jsdom.jsdom().createWindow();
  jsdom.jQueryify(window, function(window, $) {
    // remove the jquery script element
    $('script').remove();

    // TODO manifest: this.offlineManifest && 'cache.manifest'
    $('html').attr('manifest', 'cache.manifest');

    window.document.title = config.displayName || config.name;

    // append all scripts
    config.index.scripts.forEach(function (file) {
      try {
        var script = window.document.createElement('script');
        script.type = 'application/javascript';
        script.src = file.src;
        $('head').append(script);
      } catch (exn) {
        console.error(exn.stack); // TODO communicate to callback
      };
    });

    callback('<!DOCTYPE html>' + window.document.innerHTML);
  });
};
