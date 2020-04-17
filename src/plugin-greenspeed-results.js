'use strict';


const Inert = require('@hapi/inert');
const Path = require('path');
const log = require("debug")("gd:greenspeed:plugin:greenspeed-results");

const GreenspeedResults = {
  name: 'GreenspeedResults',
  version: '0.0.2',
  once: true, // ignore repeated calls to register this plugin
  register: async function(server, options) {
    log("registering plugin");

    await server.register(Inert);
    // TODO: allow setting of paths by passing in options
    server.path(Path.join(__dirname, '..', 'greenspeed-results'));

    server.route({
      method: 'GET',
      path: '/greenspeed-results/{param*}',
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          listing: true
        }
      }
    });

    log("registered plugin");
  }
}

module.exports = GreenspeedResults;
