'use strict';

const Hapi = require('@hapi/hapi');
const Path = require('path');
const log = require("debug")("gd:greenspeed:webui");
const Inert = require('@hapi/inert');
const callSitespeed = require('./callSitespeed');

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
    method: 'POST',
    path: '/',
    handler: async (request, h) => {
      const url = request.payload.url
  
      if (!url) {
        const msg = 'no URL received';
        return h.response(`Bad Request: ${msg}`).code(400);
      }
  
      if (isUrl(url)) {
        const result = await callSitespeed(url);
        if (result.errors && result.errors.length > 0) {
          return h.response(result.errors).code(400);
        } else {
          return h.response('created').code(204);
        }
      } else {
        const msg = 'bad URL received';
        return h.response(`Bad Request: ${msg}`).code(400);
      }
    },
    options: {
      auth: false,
    }
  
  });
  
  const isUrl = function(url) {
    const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(url);
  }


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
  server.route({
    method: 'GET',
    path: '/tmp/{param*}',
    handler: {
      directory: {
        path: Path.join(__dirname, '..', ',,', 'tmp/'),
        listing: true
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