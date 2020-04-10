describe("DB server plugin", () => {

  const { init, start } = require('../web-ui');
  const knexfile = require('../../knexfile');

  let server;

  beforeEach(async () => {
    options =  {
      db: {
        knex: knexfile.development
      }
    }
    server = await init(options);
    const { GreenSpeedRun } = server.models();
    await GreenSpeedRun.query().select().delete();
  });

  afterEach(async () => {
    await server.stop();
  });

  test("Submitting a site, write the page to a database", async () => {

    // check that there are no jobs in the db
    const { GreenSpeedRun } = server.models();
    const res = await GreenSpeedRun.query().count('id').first();
    const count = res["count(`id`)"]
    expect(count).toEqual(0);

    const goog = await GreenSpeedRun.query().insert({ url: 'http://google.com' })

    const res2 = await GreenSpeedRun.query().count('id').first();
    const count2 = res2["count(`id`)"]
    expect(count2).toEqual(1);




    // check there is one job
  })

  test.todo("Submitting a site redirects you to a page for the report for the url")

  test.todo("A waiting page for a url is updated after the greenspeed run has completed")
})