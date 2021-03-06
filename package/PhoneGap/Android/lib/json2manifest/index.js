#! /usr/bin/env node

// implement Object.prototype.merge for mergin JSON objects
Object.defineProperty(Object.prototype, 'merge', {
  enumerable: false,
  value: require('./merge')
})

var XML = require('./XML')
var xotree = new XML.ObjTree();

var pd = require('./pretty-data.js').pd; // for pretty printing xml strings

dump = function (config) {
  // our default android manifest in json format
  var defaultManifest = require('./default-manifest.json');

  // replace 'package' from config
  if(defaultManifest["-package"] == "${package}") {
    defaultManifest["-package"] = process.env.package;
  }

  // replace 'activity' from config
  var activityElements = defaultManifest.application.activity;
  for(var i = 0; i < activityElements.length; i++) {
    if('-android:name' in activityElements[i] && activityElements[i]['-android:name'] == "${activity}") {
      activityElements[i]['-android:name'] = '.' + process.env.activity;
    }
  }

  var result = defaultManifest;

  if('manifest' in config) {
    // config.json contains a 'manifest' section, so merge this section with our default manifest
    result = result.merge(config.manifest);
  }

  manifest = {
    "manifest" : result
  }

  // convert the resulting json to xml
  var xml = xotree.writeXML(manifest);

  // pretty print the xml
  var formattedXml = pd.xml(xml);

  console.log(formattedXml);
};

data = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (chunk) {
  data += chunk;
});

process.stdin.on('end', function () {
  dump(JSON.parse(data));
});
