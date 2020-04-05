'use strict';

const Hapi = require('@hapi/hapi');
const log = require("debug")("gd:greenspeed:webui");
const WebUI = require('./plugin-web-ui');
// const Boom = require("@hapi/boom")
// const mvdir = require('mvdir');


const init = async () => {

  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
  });

  await server.initialize();
  await server.register(WebUI);
  return server;
}

const start = async () => {
  server = init()

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