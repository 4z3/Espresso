
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

    if (config.manifest) {
      $('html').attr('manifest', config.manifest.requestPath);
    };

    window.document.title = config.displayName || config.name;

    config.htmlHeader.forEach(function (header) {
      $('head').append(header);
    });

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

    console.log('index.html, scripts:', scripts.map(function (file) { return file.filename } ));
    scripts.forEach(function (file) {
      if ('requestPath' in file) {
        try {
          var element = window.document.createElement('script');
          element.type = file.type;
          if (typeof file.requestPath === 'string') {
            element.src = file.requestPath;
          } else {
            // inline when there's no real requestPath
            element.innerHTML = file.content;
          };
          $('head').append(element);
        } catch (exn) {
          console.error(exn.stack); // TODO communicate to callback
        };
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
