'use strict';

const Hapi = require('@hapi/hapi');

const GreenSpeedAPI = require('./plugin-api')
const log = require("debug")("gd:greenspeed:api");

const start = async () => {
   const server = init();

  await server.start();
  log('Server running on %s', server.info.uri);
  return server;
};

const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0'
  });

  await server.initialize();
  await server.register(GreenSpeedAPI);
  return server;
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});


module.exports = {
  start,
  init
};