'use strict';

const Hapi = require('@hapi/hapi');

const callSitespeed = require('./callSitespeed');

const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: 'localhost'
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
    // validate: {
    // payload: {
    //     url: TODO
    // Insert your joi schema here
    //  https://hapi.dev/family/joi/tester/
    // Joi.string().uri({
    //   scheme: [
    //     'http',
    //     'https'
    //    ]
    // })

    // }
    // }
  }

});

const isUrl = function(url) {
  const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(url);
}

const init = async () => {
  await server.start();
  console.log('Server running on %s', server.info.uri);
};


process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();

module.exports = server;
