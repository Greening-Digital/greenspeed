'use strict';

const Path = require('path');
const log = require("debug")("gd:greenspeed:plugin:greenspeed-run");
const Schwifty = require('schwifty');
const Joi = require('@hapi/joi');

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
    await server.schwifty(

      // the API writes the request to a db.
      class GreenSpeedRun extends Schwifty.Model {
        static get tableName() {
          return 'greenspeed_run';
        }

        static get joiSchema() {
          return Joi.object({
            id: Joi.number(),
            requester_email: Joi.string(),
            url: Joi.string().uri({scheme: ["http", "https"]}),
            sitespeed_requested_at: Joi.date().timestamp(),
            sitespeed_response_at: Joi.date().timestamp(),
            sitespeed_status: Joi.number(),
            result_location: Joi.string(),
            inserted_at: Joi.date().timestamp(),
            updated_at: Joi.date().timestamp(),
          });
        }
      }
    );

    // set up the connection, so we can access models
    const knex = await server.knex();

    log("registered");
  }
}

module.exports = DB;
