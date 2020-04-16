describe("Worker", () => {

  const GreenSpeedWorker = require('../greenspeed-worker');

  const GreenSpeedRun = require('../models/greenspeed-run');

  const knex = require('knex');
  const knexfile = require('../../knexfile');
  const knexEnv = knex(knexfile.development);
  GreenSpeedRun.knex(knexEnv);

  jest.setTimeout.Timeout = 15 * 1000;
  jest.mock('../callSitespeed');


  describe.only("with pending jobs", () => {

    let run;

    beforeAll(async () => {

    })

    beforeEach(async () => {
      // insert entry

      const now = new Date()
      run = await GreenSpeedRun.query().insertAndFetch({
        url: "https://greening.digital",
        sitespeed_request_at: now.getTime(),
        sitespeed_status: GreenSpeedRun.statuses.PENDING,
        created_at: now.getTime()
      })
    });

    afterEach(async () => {
      if (run.id) {
        await GreenSpeedRun.query().deleteById(run.id);
      }
    });


    test("fetches a list of pending jobs", async () => {

      const res = await GreenSpeedRun.pendingRuns();
      const idList = res.map(obj => obj.id)
      expect(idList).toContain(run.id);

    });
    test.only("triggers a greenspeed run", async () => {
      // check our run is pending first
      expect(parseInt(run.sitespeed_status)).toBe(GreenSpeedRun.statuses.PENDING)

      // call run
      const worker = await GreenSpeedWorker(knexEnv);
      const updatedRun = await worker.process({ id: run.id });
      
      // check status
      expect(parseInt(updatedRun.sitespeed_status)).toBe(GreenSpeedRun.statuses.FINISHED)
      // console.log(res);
    })
    test.todo("moves the results to a directory to access")

  })

})
