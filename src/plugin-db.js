'use strict';


const log = require("debug")("gd:greenspeed:plugin:greenspeed-run");
const Schwifty = require('schwifty');
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');

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

    class GreenSpeedRun extends Schwifty.Model {
      static get tableName() {
        return 'greenspeed_run';
      }

      static get joiSchema() {
        return Joi.object({
          id: Joi.number(),
          requester_email: Joi.string(),
          url: Joi.string().uri({scheme: ["http", "https"]}),
          sitespeed_request_at: Joi.date().timestamp(),
          sitespeed_response_at: Joi.date().timestamp(),
          sitespeed_status: Joi.number(),
          result_location: Joi.string(),
          created_at: Joi.date().timestamp(),
          updated_at: Joi.date().timestamp(),
        });
      }
    }

    // register the table with Schwifty to make to make it accessible
    await server.schwifty(GreenSpeedRun);


    server.route({
      method: 'POST',
      path: '/queue-site',
      handler: async (request, h) => {
            request.log(`payload: ${request.payload}`)
            // create our object
            const now = Date.now()
            const { GreenSpeedRun } = server.models();

            await GreenSpeedRun.query().insert({
              url: request.payload.url,
              sitespeed_request_at: now,
              sitespeed_status: 1,
              created_at: now
            })
            
            return h.response().created()
      },
      options: {
        validate: {
          payload: GreenSpeedRun.joiSchema
        }
      }
    })


    log("registered");
  }
}

module.exports = DB;
