describe("DB server plugin", () => {

  const { init, start } = require('../web-ui');
  const knex = require('knex');
  const knexfile = require('../../knexfile');
  const GreenSpeedRun = require('../models/greenspeed-run');
  let server;

  jest.setTimeout.Timeout = 15 * 1000;
  jest.mock('../callSitespeed');

  beforeEach(async () => {
    options =  {
      db: {
        knex: knex(knexfile.development)
      }
    }
    server = await init(options);
    await GreenSpeedRun.knex(knex(knexfile.development));
    await GreenSpeedRun.query().select().delete();
  });

  afterEach(async () => {
    await server.stop();
  });

  test("Submitting a site, writes the page to a database", async () => {

    // check that there are no jobs in the db
    // const { GreenSpeedRun } = await server.models();

    const res = await GreenSpeedRun.query().count('id').first();
    const count = res["count(`id`)"]
    expect(count).toEqual(0);

    // const options = {
    //   method: 'POST',
    //   url: '/queue-site',
    //   payload: {
    //     url: "https://greening.digital"
    //   }
    // };

    // const data = await server.inject(options);

    // const res2 = await GreenSpeedRun.query().count('id').first();
    // const count2 = res2["count(`id`)"]
    // expect(count2).toEqual(1);
  })


  test("Submitting a site redirects you to a page for the report for the url", async () => {
    const options = {
      method: 'POST',
      url: '/queue-site',
      payload: {
        url: "https://greening.digital"
      }
    };

    const data = await server.inject(options);
    expect(data.statusCode).toBe(302);
  })


  test("A waiting page for a url is updated after the greenspeed run has completed", async () => {

    const { GreenSpeedRun } = server.models();
    const now = new Date
    const url = "https://greening.digital";

    const run = await GreenSpeedRun.query().insert({
      url: url,
      sitespeed_request_at: now,
      sitespeed_status: GreenSpeedRun.statuses.FINISHED,
    }).first()

    const options = {
      method: 'GET',
      url: `/check/${run.path()}`
    };

    const data = await server.inject(options);
    expect(data.statusCode).toBe(200);

  })

  test.skip("Nunjucks templates understand where to load paths", async () => {
    const Nunjucks = require("nunjucks");
    let env = Nunjucks.configure(Path.join(__dir, '..', 'templates'));
    let tmpl = Nunjucks.compile("index.njk", env);
    expect(tmpl.render({})).toBe(true);


  })
})