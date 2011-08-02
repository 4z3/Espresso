
module.exports = function (config) {
  if (!(this instanceof module.exports))
    throw new Error('bad usage of Conductor (use \'new\')');

  this.config = config;
};

module.exports.prototype.run = function (name, path, callback) {
  var component = this.getComponentByName(name);
  var config = this.getConfigByComponentName(name);

  // XXX the legacy_config is required for a smooth transition of
  //     parts from the legacy Espresso (AKA everything-in-app.js)
  //     to the components/ approach.
  var legacy_config = this.config;

  var instance = component(name, config, legacy_config);

  console.log(name, 'start', path);
  return instance(path, function (err) {
    console.log(name, 'end', path);
    return callback(err);
  });
};

module.exports.prototype.getComponentByName = function (name) {
  return require('../components/' + name);
};

module.exports.prototype.getConfigByComponentName = function (name) {
  return name in this.config ? this.config[name] : {};
};
  
