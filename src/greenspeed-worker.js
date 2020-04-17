
const callSitespeed = require('./callSitespeed');
const GreenSpeedRun = require('./models/greenspeed-run');
const log = require("debug")("gd:greenspeed:worker");
const mvdir = require('mvdir');
const Path = require('path');

const GreenSpeedWorker = async function(options) {
  // initialise the connection to the db
  await GreenSpeedRun.knex(options);

  return {

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

    const sitespeedParams = { timestamp: obj.sitespeed_request_at };
    const result = await callSitespeed(run.url, sitespeedParams).catch(async (err) => {
      console.log(`Error trying to check ${run.url}`)
      const failedrun = await GreenSpeedRun
        .query()
        .patch({ sitespeed_status: "FAILED" })
        .findById(obj.id);

    })



    // update with new details from the run
    const finishedRun = await GreenSpeedRun
      .query()
      .patchAndFetchById(obj.id, {
        sitespeed_status: finished,
        result_location: "TO BE ADDED"
      });

    // TODO THIS IS BREAKING THE TESTS
    log(`Finished run. Returning run.id: ${finishedRun.id}`);

    // move the results to a publicly accessible directory
    log(`Moving run results`);
    const domain = new URL(run.url).host;
    const runPath = `${domain}-${run.sitespeed_request_at}`

    await mvdir(
      Path.join(__dirname, '..', 'tmp', runPath),
      Path.join(__dirname, '..', 'greenspeed-results', runPath)
    )
    log(`Moved run results`);

    return finishedRun;


  },
  }
}

module.exports = GreenSpeedWorker