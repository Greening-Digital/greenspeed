
const callSitespeed = require('./callSitespeed');
const GreenSpeedRun = require('./models/greenspeed-run');
const log = require("debug")("gd:greenspeed:worker");
const knex = require('knex');
const knexfile = require('../knexfile');
GreenSpeedRun.knex(knex(knexfile.development));

const GreenSpeedWorker = {

  process: async function (obj) {
    const running = GreenSpeedRun.statuses.RUNNING;
    const finished = GreenSpeedRun.statuses.FINISHED;
    const failed = GreenSpeedRun.statuses.FAILED;
    // find the correpsonding run
    const run = await GreenSpeedRun.query().findById(obj.id);

    // update running status
    const inProgressRun = await GreenSpeedRun
      .query()
      .patch({ sitespeed_status: running })
      .findById(obj.id);

    log(`Starting run for ${obj.url}, ${obj.id}`)

    const result = await callSitespeed(run.url).catch(async (err) => {
      console.log(`Error trying to check ${run.url}`)
      const failedrun = await GreenSpeedRun
        .query()
        .patch({ sitespeed_status: "FAILED" })
        .findById(obj.id);

      return
    })

    // update with new details from the run
    const finishedRun = await GreenSpeedRun
      .query()
      .patchAndFetchById(obj.id, {
        sitespeed_status: finished,
        result_location: "TO BE ADDED"
      });
    log(`Finished run. Returning run.id: ${finishedRun.id}`);
    return finishedRun;


  },

}

// const init = async (options) => {

//   GreenSpeedRun.knex(knex);

// }
//   // connect to database
// const server = Hapi.server({
//   debug: { request: ['error']}
// });

// log("registering db with options.db: ", options)

// await server.register([
//   {
//     plugin: DB,
//     options: options
//   }
// ]);
// await server.initialize();


// const result = await callSitespeed(url);

// look for job

// trigger greenspeed run

// move files to necessary place


// init()
module.exports = GreenSpeedWorker