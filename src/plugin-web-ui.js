'use strict';


const Inert = require('@hapi/inert');
const Path = require('path');
const log = require("debug")("gd:greenspeed:plugin:web-ui");

const WebUI = {
  name: 'WebUI',
  version: '0.0.2',
  once: true, // ignore repeated calls to register this plugin
  register: async function(server, options) {
    await server.register(Inert);
    server.path(Path.join(__dirname, 'public'));

    server.route({
      method: 'GET',
      path: '/{param*}',
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
        },
      }
    });
  }
}

module.exports = WebUI;
