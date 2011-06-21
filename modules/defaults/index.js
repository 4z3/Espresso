

// module: defaults

exports.duty = function (callback) {
  var defaults = {};

  defaults.applicationDirectory = process.cwd();
  defaults.configFilename = defaults.applicationDirectory + '/config.json';

  defaults.buildVersion = Date.now();

  defaults.index = {
    head: {
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'viewport',
          content:
            [ 'initial-scale=1.0'
            , 'minimum-scale=1.0'
            , 'maximum-scale=1.0'
            , 'user-scalable=no'
            ]
        }
      ],
      link: [
        { rel: 'apple-touch-icon', href: '/theme/images/apple-touch-icon.png' }
      ]
    }
  };

  defaults.files = {};
  defaults.scripts = [];
  defaults.styles = [];
  defaults.images = [];

  defaults.types = {
    'js': 'application/javascript',
    'css': 'text/css',
    'manifest': 'text/cache-manifest',
    'html': 'text/html',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'json': 'application/json'
  };

  defaults.reachable = [];
  defaults.root_filenames = [];
  
  callback(defaults);
};
