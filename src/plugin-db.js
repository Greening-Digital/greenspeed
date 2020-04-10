'use strict';


const log = require("debug")("gd:greenspeed:plugin:greenspeed-run");
const Schwifty = require('schwifty');
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const GreenSpeedRun = require('./models/greenspeed-run')

const DB = {
  name: 'DB',
  version: '0.0.2',
  once: true, // ignore repeated calls to register this plugin
  register: async function(server, options) {
    log("registering");
    // We declare the model that the rest of the app uses here to
    // represent a greenspeed run.

    await server.register({
      plugin: Schwifty,
      options: {
          knex: options.db.knex
      }
    });


    // register the table with Schwifty to make to make it accessible
    await server.schwifty(GreenSpeedRun);


    server.route({
      method: 'POST',
      path: '/queue-site',
      handler: async (request, h) => {
            request.log(`payload: ${request.payload}`)
            // create our object
            const now = new Date()
            const { GreenSpeedRun } = server.models();

            await GreenSpeedRun.query().insert({
              url: request.payload.url,
              sitespeed_request_at: now.getTime(),
              sitespeed_status: GreenSpeedRun.statuses.PENDING,
              created_at: now.getTime()
            })
            const domain = new URL(request.payload.url).host;
            return h.response().redirect(`${domain}-${now.getTime()}`)
      },
      options: {
        validate: {
          payload: GreenSpeedRun.joiSchema
        }
      }
    })

    server.route({
      method: 'GET',
      path: '/check/',
      handler: async (request, h) => {
        return Boom.badRequest()
      }
    })

    log("registered");
  }

}

module.exports = DB;
