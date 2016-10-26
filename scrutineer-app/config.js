var global_config = require(`./config/global.js`);
var env_config = require(`./config/${process.env.NODE_ENV}.js`);

module.exports =  Object.assign({}, global_config, env_config);