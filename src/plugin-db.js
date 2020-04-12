'use strict';

const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const Vision = require('@hapi/vision');
const Nunjucks = require('nunjucks');
const Schwifty = require('schwifty');

const GreenSpeedRun = require('./models/greenspeed-run')
const log = require("debug")("gd:greenspeed:plugin:greenspeed-run");



const DB = {
  name: 'DB',
  version: '0.0.2',
  once: true, // ignore repeated calls to register this plugin
  register: async function (server, options) {
    log("registering");
    // We declare the model that the rest of the app uses here to
    // represent a greenspeed run.

    await server.register({
      plugin: Schwifty,
      options: {
        knex: options.db.knex
      }
    });
    await server.register(Vision);

    // register the table with Schwifty to make to make it accessible
    await server.schwifty(GreenSpeedRun);


    server.route({
      method: 'POST',
      path: '/queue-site',
      handler: async (request, h) => {
        request.log(`payload: ${request.payload.url}`)
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
        return h.response().redirect(`/check/${domain}-${now.getTime()}`)
      },
      options: {

        validate: {
          payload: GreenSpeedRun.joiSchema
        }
      }
    })

    server.views({
      engines: {
        html: {
          compile: (src, options) => {
            const template = Nunjucks.compile(src, options.environment);
            return (context) => {
              return template.render(context);
            };
          },

          prepare: (options, next) => {
            options.compileOptions.environment = Nunjucks.configure(options.path, { watch: false });
            return next();
          }
        }
      },
      relativeTo: __dirname,
      path: 'templates'
    });




    server.route({
      method: 'GET',
      path: '/check/{checkPath}',
      handler: async (request, h) => {
        console.log(request.params.checkPath);
        // TODO add check for safety
        const checkPath = request.params.checkPath;

        let timestamp = checkPath.split("-").slice(-1)[0];

        const { GreenSpeedRun } = server.models();
        // add the template

        const run = await GreenSpeedRun.query()
          .where('sitespeed_request_at', timestamp).first();

        console.log(run);
        // console.log(run.path());

        const ctx = {
          title: `Results for Greenspeed run`,
          message: "This seems to be working",
          run
        }

        return h.view('index', ctx);
      }
    })

    log("registered");
  }

}

module.exports = DB;
