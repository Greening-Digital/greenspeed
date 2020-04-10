'use strict';

const Hapi = require('@hapi/hapi');

const callSitespeed = require('./callSitespeed');
const log = require("debug")("gd:greenspeed:plugin");



const isUrl = function(url) {
  const regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(url);
}

const GreenSpeedAPI = {
  name: 'greenSpeedAPI',
  version: '0.0.2',
  once: true, // ignore repeated calls to register this plugin
  register: async function(server, options) {

    log("registering");

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
      }
    });

    log("registered");
  }
}

module.exports = GreenSpeedAPI;
