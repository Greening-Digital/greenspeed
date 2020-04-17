'use strict';

const Hapi = require('@hapi/hapi');
const log = require("debug")("gd:greenspeed:webui");
const WebUI = require('./plugin-web-ui');
const GreenspeedResults = require('./plugin-greenspeed-results');
const DB = require('./plugin-db');

const init = async (options) => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    debug: { request: '*'}
  });

  log("registering db with options.db: ", options)
  await server.register([
    WebUI,
    GreenspeedResults,
    {
      plugin: DB,
      options: options
    }
  ]);
  await server.initialize();
  return server;
}

const start = async (options) => {

  const server = await init(options);

  await server.start();
  log('Server running on %s', server.info.uri);
  return server;
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});


module.exports = {
  start,
  init
}