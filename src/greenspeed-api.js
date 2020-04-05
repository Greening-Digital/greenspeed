'use strict';

const Hapi = require('@hapi/hapi');

const callSitespeed = require('./callSitespeed');
const log = require("debug")("gd:greenspeed:plugin");


const GreenSpeedAPIPLugin = {
  name: 'greenSpeedAPI',
  version: '0.0.2',
  once: true, // ignore repeated calls to register this plugin
  register: async function(server, options) {

    server.route({
      method: 'GET',
      path: '/test',
      handler: function (request, h) {
          return 'hello, world';
      }
    })
    log("greenSpeedAPI registered");
  }
}

module.exports = GreenSpeedAPIPLugin;
