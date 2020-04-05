describe("WebUI Server", () => {

  const { init, start } = require('../web-ui');

  let server;

  beforeEach(async () => {
    server = await init();
  });

  afterEach(async () => {
    await server.stop();
  });


  test.skip("GET / - serves a static page for submissions", async () => {
    const options = {
      method: 'GET',
      url: '/'
    };
    const data = await server.inject(options);
    expect(data.statusCode).toBe(200);
  })

  test.todo("Submitting a site, takes you to a waiting page for the results")

  test.todo("Submitting a site, saves the site, and pending of the run")

  test.todo("Waiting page for the results are updated after its greenspeed run has completed")
})