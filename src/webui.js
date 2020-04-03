'use strict';

const Hapi = require('@hapi/hapi');
const Path = require('path');
const log = require("debug")("gd:greenspeed:webui");
const Inert = require('@hapi/inert');
// const Boom = require("@hapi/boom")
// const mvdir = require('mvdir');

const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: {
      files: {
          relativeTo: Path.join(__dirname, 'public')
      }
    }
});

const start = async () => {
  await server.start();
  log('Server running on %s', server.info.uri);
  return server;
};

const init = async () => {

  await server.register(Inert);

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: '.',
        redirectToSlash: true,
      }
    }
  });
  await server.initialize();
  log('Server initialized');
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