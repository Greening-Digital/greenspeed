'use strict';

const Hapi = require('@hapi/hapi');
const Path = require('path');
const Inert = require('@hapi/inert');
const Boom = require("@hapi/boom")
const mvdir = require('mvdir');

const callSitespeed = require('./callSitespeed');

const moveFilesToPublic = async function (source, dest) {
  console.log(`moving files, from ${source}, to ${dest}`);
  await mvdir(source, dest);
}

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: 'localhost',
    routes: {
      files: {
          relativeTo: Path.join(__dirname, 'public')
      }
    }

  });
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
        const siteSpeedRun = await callSitespeed(url).catch(function(err) {
          console.log(err)
          return Boom.badRequest("Bad request", siteSpeedRun.result.errors);
          // return h.response(siteSpeedRun.result.errors).code(400);
        })
        if (siteSpeedRun.result.errors && siteSpeedRun.result.errors.length > 0) {
          // return h.response(siteSpeedRun.result.errors).code(400);
          return Boom.badRequest("Bad request", siteSpeedRun.result.errors);
        } else {
          await moveFilesToPublic(
            Path.join(__dirname, "..", "tmp", siteSpeedRun.path),
            Path.join(__dirname, "public", "results", siteSpeedRun.path))

          // return {
          //   siteSpeedRun,
          // }
          return h.redirect(`/results/${siteSpeedRun.path}`);
          // return h.response('created').code(204);
        }
      } else {
        const msg = 'bad URL received';
        return Boom.badRequest("Bad request", msg);
        // return h.response(`Bad Request: ${msg}`).code(400);
      }
    },
    options: {
      auth: false,
    }
  
  });
  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: '.',
            redirectToSlash: true
        }
    }
  });
  
  
  const isUrl = function(url) {
    const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    return regexp.test(url);
  }


  await server.start();
  console.log('Server running on %s', server.info.uri);
};


process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

module.exports = init;
