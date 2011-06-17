
// module: index.html

jsdom = require('jsdom');

exports.deps = [ 'config' ];

exports.duty = function (callback) {
  var config = this.config;

  var main_script = [];
  var script_srcs = [];


  // TODO move this to phonegap
  var PhoneGap = true; //this.environment === 'PhoneGap';
  if (PhoneGap) {
    script_srcs.push('phonegap.js');
  };
  main_script.push('var PhoneGap = ' + PhoneGap);

  // TODO
  //
  // Add frameworks in correct order.
  //
  [ 'jquery'
  //, 'bootstrapping'
  , 'jquery_mobile'
  //, 'jquery_mobile_plugins'
  //, 'jquery_mobile_plugins-theme'
  //, 'underscore'
  //, 'themes'
  //, 'tmp_themes'
  ].forEach(function (fw) {
    script_srcs.push(fw + '.js');
  });

  //[ 'theme/style.css' ]
  //[ 'core.js', 'ui.js' ]
  //_frameworkNamesForIndexHtml.forEach(_pushScriptPath);
  //if (this.supportedLanguages.length > 0) {
  //  this.supportedLanguages.forEach(function (lang) {
  //    _pushScriptPath(lang + '.js');
  //  });
  //};

  script_srcs.push(config.name + '_App.js');

  // TODO order...
  main_script.push('M.Application.name = ' + JSON.stringify(config.name));
  main_script.push(config.name + '.app.main()');


  //
  // Generate index.html
  //
  var window = jsdom.jsdom().createWindow();
  jsdom.jQueryify(window, function(window, $) {

    // TODO manifest: this.offlineManifest && 'cache.manifest'
    $('html').attr('manifest', 'cache.manifest');

    window.document.title = config.displayName || config.name;

    // TODO meta [no particular order]
    // TODO link !stylesheet [no particular order]
    // TODO link stylesheet [ordered

    // append all script srcs
    script_srcs.forEach(function (src) {
      try {
        var script = window.document.createElement('script');
        script.type = 'application/javascript';
        script.src = src;
        $('head').append(script);
      } catch (exn) {
        console.error(exn.stack); // TODO communicate to callback
      };
    });

    // build the main script
    try {
      var script = window.document.createElement('script');
      script.type = 'application/javascript';
      script.innerHTML = main_script.join(';') + ';';
      $('head').append(script);
    } catch (exn) {
      console.error(exn.stack);
    };

    callback('<!DOCTYPE html>' + window.document.innerHTML);
  });
};
