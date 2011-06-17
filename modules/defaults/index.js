

// module: defaults

exports.duty = function (callback) {
  var defaults = {};

  defaults.applicationDirectory = process.cwd();
  defaults.configFilename = defaults.applicationDirectory + '/config.json';

  defaults.index = {
    doctype: 'html',
    head : {
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/theme/images/apple-touch-icon.png' }
      ]
    }
  };
  
  callback(defaults);
};
