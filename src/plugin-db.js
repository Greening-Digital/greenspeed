'use strict';

const EventEmitter = require('events');
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const Vision = require('@hapi/vision');
const Nunjucks = require('nunjucks');
const Schwifty = require('schwifty');
const Path = require('path');

const GreenSpeedRun = require('./models/greenspeed-run')
const GreenSpeedWorker = require('./greenspeed-worker')
const log = require("debug")("gd:greenspeed:plugin:greenspeed-run");

const PoorMansSideKiq = new EventEmitter();


PoorMansSideKiq.on('run', async function (obj) {
  log(`Queueing up a job to check ${obj.url}`);
  await GreenSpeedWorker.process(obj);
})


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

        const run = await GreenSpeedRun.query().insertAndFetch({
          url: request.payload.url,
          sitespeed_request_at: now.getTime(),
          sitespeed_status: GreenSpeedRun.statuses.PENDING,
          created_at: now.getTime()
        })
        const domain = new URL(request.payload.url).host;
        log(`Created run: ${run.id} for ${domain}`);
        PoorMansSideKiq.emit('run', run)
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
        njk: {
          compile: (src, options) => {
            const template = Nunjucks.compile(src, options.environment);
            return (context) => {
              return template.render(context);
            };
          },

          prepare: (options, next) => {
            options.compileOptions.environment = Nunjucks.configure(Path.join(options.relativeTo, options.path), { watch: false, dev: true });
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
        log(request.params.checkPath);
        // TODO add check for safety
        const checkPath = request.params.checkPath;

        let timestamp = checkPath.split("-").slice(-1)[0];

        const { GreenSpeedRun } = server.models();

        const run = await GreenSpeedRun.query()
          .where('sitespeed_request_at', timestamp).first();

        log(run);

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
