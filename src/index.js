'use strict';

const Hapi = require('@hapi/hapi');

const callSitespeed = require('./callSitespeed');
const log = require("debug")("gd:greenspeed:server");

const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: '0.0.0.0'
});

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

const start = async () => {
  await server.start();
  log('Server running on %s', server.info.uri);
  return server;
};

const init = async () => {
  await server.initialize();
  log('Server running on %s', server.info.uri);
  return server;
};



process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});


module.exports = {
  start,
  init,
  server
};