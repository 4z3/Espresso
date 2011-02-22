** Version 0.0.9 - Date 22.02.2011 **

  * Added new feature: when starting m-server and running the application in a browser, the application
    is automatically re-build every time the browser is getting refreshed. Not cache.manifest is generated during the build.
  * Added new command line arguments for m-server.js: -m, --manifest run the server in manifest mode, to compile and
    the application with cache.manifest.  
  * Fixed bug: server is now handling POST requests correctly.  

** Version 0.0.8-1 - Date 09.02.2011 **

  * Fixed bug: jQuery, jQuery Mobile and underscore are now sorted in the needed order
    before they are included into the index.html.
  * Added new command line arguments for m-init.js: '-d, --dir [custom project directory]  a custom project directory'
    node m-init.js -p myNewProject -d /Users/Foo/Work      will generate a new project in /Users/Foo/Work"


** Version 0.0.8 - Date 08.02.2011 **

  * Added property: 'offlineManifest: true/false' in the config.json, to switch on/off the generation of the
    offline manifest.
  * Added property: 'environment: PhoneGap/Web' in the config.json, to switch on/off the usage of the phonegap.js.
    default is 'Web'
  * Added property: 'm_serverPort: "Port"' to run the built-in server on a custom port.
  * Added property: 'm_serverHostname: "Hostname"' to run the built-in server on a custom hostname.
  * Added property: 'htmlHeader' to customize the HEAD entries in the index.html.
  * Added detection of "circles" in the m_require chain.
  * Added command line arguments for m-server.js

** Version 0.0.7-1 - Date 01.02.2011 **

  * Added feature to use the refs attribute of the libraries property
    to sort the library entries in the index.html
  * Fixed a bug, which leads to a crash on Windows when addressing the file of a
    3rd Party lib, that is existing.

** Version 0.0.7 - Date 31.01.2011 **

  * Added support for 3rd Party Libs.
  * Deleted leading '/' in the cache.manifest
  * Fixed typo, where reference to 'task.js' is written in uppercase
